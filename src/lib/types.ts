export interface MinisterRecord {
  id: string;
  name: string;
  credentialNumber: string;
  designation: string;
  designationOther: string;
  status: string;
  yearInducted: string;
  yearLicensed: string;
  yearOrdained: string;
  district: string;
  zone: string;
  church: string;
  dob: string;
  email: string;
  phone: string;
  primarySchool: string;
  primaryDate: string;
  primaryCert: string;
  secondarySchool: string;
  secondaryDate: string;
  secondaryCert: string;
  tertiary: string;
  tertiaryDate: string;
  tertiaryCert: string;
  theoSchool: string;
  theoDate: string;
  theoCert: string;
}

export const FIELD_KEYS: (keyof Omit<MinisterRecord, 'id' | 'status'>)[] = [
  'name', 'credentialNumber', 'designation', 'designationOther',
  'yearInducted', 'yearLicensed', 'yearOrdained',
  'district', 'zone', 'church',
  'dob', 'email', 'phone',
  'primarySchool', 'primaryDate', 'primaryCert',
  'secondarySchool', 'secondaryDate', 'secondaryCert',
  'tertiary', 'tertiaryDate', 'tertiaryCert',
  'theoSchool', 'theoDate', 'theoCert',
];
