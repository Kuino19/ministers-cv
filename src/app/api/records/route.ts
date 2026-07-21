import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole === 'MINISTER') {
      const records = await prisma.ministerRecord.findMany({
        where: { id: userId },
      });
      return NextResponse.json(records);
    }

    const records = await prisma.ministerRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(records);
  } catch (err) {
    console.error('Failed to fetch records:', err);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      credentialNumber,
      designation,
      designationOther,
      status,
      yearInducted,
      yearLicensed,
      yearOrdained,
      district,
      zone,
      church,
      dob,
      email,
      phone,
      primarySchool,
      primaryDate,
      primaryCert,
      secondarySchool,
      secondaryDate,
      secondaryCert,
      tertiary,
      tertiaryDate,
      tertiaryCert,
      theoSchool,
      theoDate,
      theoCert,
      profCert,
      otherAppointments,
      houseAddress,
      certificateUrls,
    } = body;

    if (!name || !credentialNumber || !designation || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const newRecord = await prisma.ministerRecord.create({
      data: {
        name,
        credentialNumber,
        designation,
        designationOther,
        status,
        yearInducted,
        yearLicensed,
        yearOrdained,
        district,
        zone,
        church,
        dob,
        email,
        phone,
        primarySchool,
        primaryDate,
        primaryCert,
        secondarySchool,
        secondaryDate,
        secondaryCert,
        tertiary,
        tertiaryDate,
        tertiaryCert,
        theoSchool,
        theoDate,
        theoCert,
        profCert,
        otherAppointments,
        houseAddress,
        certificateUrls,
        createdById: userId || null,
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (err) {
    console.error('Failed to create record:', err);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
