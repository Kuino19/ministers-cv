import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { esc } from '@/lib/cv-template';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Find records that haven't been updated in a year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const staleRecords = await prisma.ministerRecord.findMany({
      where: {
        updatedAt: { lte: oneYearAgo },
        email: { not: null },
      },
      take: 50, // Process in batches
    });

    for (const record of staleRecords) {
      if (!record.email) continue;
      
      await resend.emails.send({
        from: 'Foursquare CV Register <admin@goanitech.com>',
        to: record.email,
        subject: 'Annual Update: Minister CV Register',
        html: `
          <h3>Hello ${esc(record.name)},</h3>
          <p>It has been a year since your Minister CV was last updated in our register.</p>
          <p>Please log in to the portal and ensure all your details are still current.</p>
          <p>Thank you.</p>
        `
      });

      // Update the updatedAt timestamp so they don't get emailed again tomorrow
      await prisma.ministerRecord.update({
        where: { id: record.id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ message: `Sent ${staleRecords.length} reminders` });
  } catch (err: any) {
    console.error('Failed to run reminders cron:', err);
    return NextResponse.json({ error: 'Cron failed', details: err.message }, { status: 500 });
  }
}
