import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { pdfBase64, email, name } = await req.json();

    if (!pdfBase64 || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Strip the data URI prefix safely
    const base64Data = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;

    const { data, error } = await resend.emails.send({
      from: 'Foursquare CV Register <admin@goanitech.com>',
      to: email,
      subject: 'Your Minister CV',
      text: `Hello ${name},\n\nPlease find your generated Minister CV attached to this email.\n\nBest regards,\nFoursquare CV Register`,
      attachments: [
        {
          filename: `${(name || 'Minister').replace(/\s+/g, '_')}_CV.pdf`,
          content: base64Data,
        },
      ],
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message || JSON.stringify(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email sending completely failed:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
