import { cvHTML } from './src/lib/cv-template';
import fs from 'fs';
import path from 'path';

const dummyData = {
  id: "dummy-1",
  name: "Rev. Ifedayo Lawal",
  email: "ifedayo@example.com",
  phone: "+234 800 000 0000",
  houseAddress: "123 Foursquare Avenue, Lagos, Nigeria",
  dob: "1980-01-01",
  status: "Ordained",
  credentialNumber: "10934",
  yearInducted: "2005",
  yearLicensed: "2008",
  yearOrdained: "2012",
  designation: "Senior Pastor",
  designationOther: null,
  church: "Foursquare Gospel Church Yaba",
  district: "Yaba",
  zone: "Lagos Mainland",
  otherAppointments: "National Youth Director",
  profCert: "ICAN, PMP",
  tertiary: "University of Lagos",
  tertiaryDate: "2002",
  tertiaryCert: "B.Sc Computer Science",
  secondarySchool: "King's College Lagos",
  secondaryDate: "1997",
  secondaryCert: "SSCE",
  primarySchool: "Grace Children School",
  primaryDate: "1991",
  primaryCert: "FSLC",
  theoSchool: "LIFE Theological Seminary",
  theoDate: "2006-2008",
  theoCert: "Diploma in Theology",
  certificateUrls: "https://example.com/cert1.pdf",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const htmlContent = cvHTML(dummyData as any);

fs.writeFileSync(path.join(process.cwd(), 'public', 'cv-preview.html'), htmlContent);
console.log('Preview generated at public/cv-preview.html');
