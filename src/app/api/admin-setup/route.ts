import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminEmail = 'admin@church.org';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('changeme123', 10);
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Administrator',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      return NextResponse.json({ message: `Success! Admin created: ${admin.email}` });
    } else {
      const hashedPassword = await bcrypt.hash('changeme123', 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword },
      });
      return NextResponse.json({ message: `Success! Admin already existed. Password reset to default.` });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
