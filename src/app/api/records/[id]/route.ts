import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
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
    } = body;

    const updated = await prisma.ministerRecord.update({
      where: { id },
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
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Failed to update record:', err);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const userRole = (session.user as any).role;
  const userId = (session.user as any).id;

  try {
    const record = await prisma.ministerRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Admins can delete any record; Staff can delete records created by themselves
    if (userRole !== 'ADMIN' && record.createdById !== userId) {
      return NextResponse.json({ error: 'Forbidden: You can only delete records you created.' }, { status: 403 });
    }

    await prisma.ministerRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Record deleted' });
  } catch (err) {
    console.error('Failed to delete record:', err);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
