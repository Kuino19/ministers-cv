import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const search = searchParams.get('search') || '';
  const skip = (page - 1) * limit;

  try {
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole === 'MINISTER') {
      const records = await prisma.ministerRecord.findMany({
        where: { id: userId },
      });
      return NextResponse.json({ records, total: records.length, page: 1, totalPages: 1 });
    }

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { credentialNumber: { contains: search, mode: 'insensitive' as const } },
            { church: { contains: search, mode: 'insensitive' as const } },
            { district: { contains: search, mode: 'insensitive' as const } },
            { zone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [records, total] = await Promise.all([
      prisma.ministerRecord.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.ministerRecord.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

    // Check for duplicate credential number
    const existing = await prisma.ministerRecord.findFirst({
      where: { credentialNumber: { equals: credentialNumber, mode: 'insensitive' } },
    });
    if (existing) {
      return NextResponse.json({ error: `A minister with credential number "${credentialNumber}" already exists.` }, { status: 409 });
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

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        ministerId: newRecord.id,
        adminId: userId,
        details: JSON.stringify({ name: newRecord.name, credentialNumber: newRecord.credentialNumber }),
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (err) {
    console.error('Failed to create record:', err);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
