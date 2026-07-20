import { MinisterRecord } from './types';

export function esc(str: string | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function val(v: string | undefined | null): string {
  return v && String(v).trim() ? v : '—';
}

export function initials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function fileSafeName(name: string): string {
  return (name || 'minister')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/(^-|-$)/g, '') || 'minister';
}

export function designationLabel(r: MinisterRecord): string {
  return r.designation === 'Other'
    ? r.designationOther || 'Other'
    : r.designation;
}

export function cvHTML(r: MinisterRecord): string {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
  <div style="font-family:Georgia,'Times New Roman',serif;color:#1B2A20;width:100%;max-width:720px;margin:0 auto;padding:36px 40px;background:#ffffff;">
    <div style="display:table;width:100%;border-bottom:3px solid #1F4D36;padding-bottom:16px;margin-bottom:20px;">
      <div style="display:table-cell;vertical-align:middle;width:64px;">
        <div style="width:54px;height:54px;border-radius:50%;background:#1F4D36;border:2px solid #A2792B;color:#fff;text-align:center;line-height:54px;font-size:19px;font-weight:bold;">${esc(initials(r.name))}</div>
      </div>
      <div style="display:table-cell;vertical-align:middle;padding-left:16px;">
        <div style="font-size:24px;font-weight:bold;color:#123021;">${esc(r.name)}</div>
        <div style="font-size:13.5px;color:#4A5A4E;margin-top:2px;">${esc(designationLabel(r))}${r.church ? ' &middot; ' + esc(r.church) : ''}</div>
      </div>
      <div style="display:table-cell;vertical-align:middle;text-align:right;white-space:nowrap;">
        <div style="font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#4A5A4E;">Credential No.</div>
        <div style="font-size:15px;font-weight:bold;color:#A2792B;font-family:'Courier New',monospace;">${esc(r.credentialNumber)}</div>
      </div>
    </div>

    <h3 style="font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#1F4D36;border-bottom:1px solid #DDD6C2;padding-bottom:6px;margin:22px 0 10px;">Ministerial Record</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
      <tr><td style="padding:4px 0;width:38%;color:#4A5A4E;">Status</td><td style="padding:4px 0;">${esc(val(r.status))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Year Inducted</td><td style="padding:4px 0;">${esc(val(r.yearInducted))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Year Licensed</td><td style="padding:4px 0;">${esc(val(r.yearLicensed))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Year Ordained</td><td style="padding:4px 0;">${esc(val(r.yearOrdained))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">District</td><td style="padding:4px 0;">${esc(val(r.district))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Zone</td><td style="padding:4px 0;">${esc(val(r.zone))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Church</td><td style="padding:4px 0;">${esc(val(r.church))}</td></tr>
    </table>

    <h3 style="font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#1F4D36;border-bottom:1px solid #DDD6C2;padding-bottom:6px;margin:22px 0 10px;">Personal &amp; Contact Information</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
      <tr><td style="padding:4px 0;width:38%;color:#4A5A4E;">Date of Birth</td><td style="padding:4px 0;">${esc(val(r.dob))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Email</td><td style="padding:4px 0;">${esc(val(r.email))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Phone</td><td style="padding:4px 0;">${esc(val(r.phone))}</td></tr>
    </table>

    <h3 style="font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#1F4D36;border-bottom:1px solid #DDD6C2;padding-bottom:6px;margin:22px 0 10px;">Educational Qualification</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#F5F2E8;">
          <th style="text-align:left;padding:6px 8px;border:1px solid #DDD6C2;">Level</th>
          <th style="text-align:left;padding:6px 8px;border:1px solid #DDD6C2;">Institution</th>
          <th style="text-align:left;padding:6px 8px;border:1px solid #DDD6C2;">Date</th>
          <th style="text-align:left;padding:6px 8px;border:1px solid #DDD6C2;">Certificate(s)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding:6px 8px;border:1px solid #DDD6C2;">Primary</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.primarySchool))}</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.primaryDate))}</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.primaryCert))}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #DDD6C2;">Secondary</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.secondarySchool))}</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.secondaryDate))}</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.secondaryCert))}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #DDD6C2;">Tertiary</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.tertiary))}</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.tertiaryDate))}</td><td style="padding:6px 8px;border:1px solid #DDD6C2;">${esc(val(r.tertiaryCert))}</td></tr>
      </tbody>
    </table>

    <h3 style="font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#1F4D36;border-bottom:1px solid #DDD6C2;padding-bottom:6px;margin:22px 0 10px;">Theological Education</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
      <tr><td style="padding:4px 0;width:38%;color:#4A5A4E;">School(s) Attended</td><td style="padding:4px 0;">${esc(val(r.theoSchool))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Date</td><td style="padding:4px 0;">${esc(val(r.theoDate))}</td></tr>
      <tr><td style="padding:4px 0;color:#4A5A4E;">Certificate(s)</td><td style="padding:4px 0;">${esc(val(r.theoCert))}</td></tr>
    </table>

    <div style="margin-top:28px;padding-top:10px;border-top:1px solid #DDD6C2;font-size:10.5px;color:#8a9188;">Generated ${today} &middot; Ministerial Records Register</div>
  </div>`;
}
