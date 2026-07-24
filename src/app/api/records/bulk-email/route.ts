import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recordIds, subject, message } = await req.json();

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json({ error: 'No records selected' }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const userId = (session.user as any).id;

    // Fetch records to get their emails
    const records = await prisma.ministerRecord.findMany({
      where: {
        id: { in: recordIds },
        email: { not: null },
      },
      select: { id: true, name: true, email: true },
    });

    if (records.length === 0) {
      return NextResponse.json({ error: 'None of the selected records have valid email addresses.' }, { status: 400 });
    }

    let successCount = 0;
    
    // Batch process to avoid hitting limits or timeouts too quickly
    // (Resend allows up to 100 emails/day on free tier, batching helps manage flow)
    for (const record of records) {
      if (!record.email) continue;

      try {
        await resend.emails.send({
          from: 'Foursquare CV Register <admin@goanitech.com>',
          to: record.email,
          subject: subject,
          html: `
            <div style="font-family: sans-serif; color: #111;">
              <h3>Dear ${escapeHtml(record.name)},</h3>
              <div style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(message)}</div>
              <br/>
              <p><i>- Admin, Foursquare Gospel Church in Nigeria</i></p>
            </div>
          `
        });
        successCount++;
      } catch (emailErr) {
        console.error(`Failed to email ${record.email}`, emailErr);
      }
    }

    // Log the bulk action
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        ministerId: null, // Global action
        adminId: userId,
        details: JSON.stringify({ 
          action: 'BULK_EMAIL', 
          subject, 
          attempted: recordIds.length, 
          successful: successCount 
        }),
      },
    });

    return NextResponse.json({ 
      message: `Successfully sent ${successCount} emails.`,
      successCount,
      failedCount: recordIds.length - successCount 
    });

  } catch (err: any) {
    console.error('Failed to send bulk email:', err);
    return NextResponse.json({ error: 'Failed to send bulk emails', details: err.message }, { status: 500 });
  }
}
