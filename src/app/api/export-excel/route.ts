import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import * as xlsx from 'xlsx';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const records = await prisma.ministerRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10000, // Safety limit to prevent memory overload on serverless
    });

    const data = records.map(r => ({
      'Full Name': r.name,
      'Credential Number': r.credentialNumber,
      'Designation': r.designation === 'Other' ? r.designationOther : r.designation,
      'Status': r.status,
      'Church': r.church || '',
      'District': r.district || '',
      'Zone': r.zone || '',
      'Email': r.email || '',
      'Phone': r.phone || '',
      'Date of Birth': r.dob || '',
      'Year Inducted': r.yearInducted || '',
      'Year Licensed': r.yearLicensed || '',
      'Year Ordained': r.yearOrdained || '',
      'House Address': r.houseAddress || '',
      'Primary School': r.primarySchool || '',
      'Secondary School': r.secondarySchool || '',
      'Tertiary Institution': r.tertiary || '',
      'Theological School': r.theoSchool || '',
      'Professional Certifications': r.profCert || '',
      'Other Appointments': r.otherAppointments || '',
      'Date Created': r.createdAt.toLocaleDateString(),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Minister CVs');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Ministers_Register.xlsx"',
      },
    });
  } catch (err) {
    console.error('Failed to export excel:', err);
    return NextResponse.json({ error: 'Failed to export excel' }, { status: 500 });
  }
}
