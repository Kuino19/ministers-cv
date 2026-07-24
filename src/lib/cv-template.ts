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
  <div style="font-family:'Inter', 'Arial', sans-serif; color:#1B2A20; width:100%; max-width:750px; margin:0 auto; padding:48px 48px; background:#ffffff; box-sizing:border-box; line-height:1.5; position:relative;">
    
    <!-- WATERMARK BACKGROUND -->
    <div style="position:absolute; top:0; left:0; right:0; bottom:0; background-image:url('/logo.png'); background-repeat:no-repeat; background-position:center; background-size:50%; opacity:0.04; z-index:0; pointer-events:none;"></div>

    <!-- INNER PAGE BORDER -->
    <div style="position:relative; z-index:1; border:3px double #1F4D36; padding:36px 36px; border-radius:4px;">
    
      <!-- FOURSQUARE HEADER -->
      <div style="border-bottom:2.5px solid #1F4D36; padding-bottom:16px; margin-bottom:24px; text-align:center;">
        <img src="/logo.png" alt="FOURSQUARE LOGO" style="max-height: 80px; margin-bottom: 8px;" />
      <h2 style="font-family:Georgia, serif; font-size:20px; font-weight:bold; color:#1F4D36; margin:0 0 4px 0; text-transform:uppercase;">FOURSQUARE GOSPEL CHURCH IN NIGERIA</h2>
      <h3 style="font-family:Georgia, serif; font-size:16px; font-weight:bold; color:#A2792B; margin:0 0 16px 0; text-transform:uppercase;">MINISTERIAL CV</h3>
    </div>
    
    <!-- CV TITLE & NAME HEADER -->
    <div style="margin-bottom:24px;">
      <div style="display:table; width:100%;">
        <div style="display:table-cell; vertical-align:top;">
          <h1 style="font-family:Georgia, serif; font-size:28px; font-weight:bold; color:#123021; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">
            ${esc(r.name)}
          </h1>
          <div style="font-size:15px; font-weight:600; color:#A2792B; margin-bottom:6px;">
            ${esc(designationLabel(r))}${r.church ? ' &bull; ' + esc(r.church) : ''}
          </div>
          <div style="font-size:12.5px; color:#4A5A4E; line-height:1.6;">
            ${r.phone ? '<strong>Phone:</strong> ' + esc(r.phone) : ''}
            ${r.phone && r.email ? ' &nbsp;|&nbsp; ' : ''}
            ${r.email ? '<strong>Email:</strong> ' + esc(r.email) : ''}
            ${(r.phone || r.email) && r.dob ? ' &nbsp;|&nbsp; ' : ''}
            ${r.dob ? '<strong>DOB:</strong> ' + esc(r.dob) : ''}
            ${r.houseAddress ? '<br/><strong>Address:</strong> ' + esc(r.houseAddress) : ''}
          </div>
        </div>
        <div style="display:table-cell; vertical-align:top; text-align:right; width:180px;">
          <div style="display:inline-block; border:1px solid #1F4D36; padding:6px 12px; border-radius:4px; background:#F5F8F6; text-align:center;">
            <div style="font-size:9.5px; font-weight:bold; text-transform:uppercase; letter-spacing:0.1em; color:#1F4D36;">CURRICULUM VITAE</div>
            <div style="font-size:11px; font-weight:bold; color:#A2792B; font-family:monospace; margin-top:2px;">No: ${esc(val(r.credentialNumber))}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ECCLESIASTICAL CREDENTIALS & SUMMARY -->
    <div style="margin-bottom:22px;">
      <h2 style="font-family:Georgia, serif; font-size:13px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:#1F4D36; border-bottom:1.5px solid #1F4D36; padding-bottom:4px; margin:0 0 10px 0;">
        Ministerial Status &amp; Credentials
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tbody>
          <tr>
            <td style="padding:4px 0; width:30%; color:#4A5A4E; font-weight:500;">Ecclesiastical Status:</td>
            <td style="padding:4px 0; font-weight:bold; color:#123021;">${esc(val(r.status))}</td>
            <td style="padding:4px 0; width:25%; color:#4A5A4E; font-weight:500;">Year Inducted:</td>
            <td style="padding:4px 0; font-weight:600; color:#123021;">${esc(val(r.yearInducted))}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Year Licensed:</td>
            <td style="padding:4px 0; font-weight:600; color:#123021;">${esc(val(r.yearLicensed))}</td>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Year Ordained:</td>
            <td style="padding:4px 0; font-weight:600; color:#123021;">${esc(val(r.yearOrdained))}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MINISTERIAL & PASTORAL JURISDICTION -->
    <div style="margin-bottom:22px;">
      <h2 style="font-family:Georgia, serif; font-size:13px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:#1F4D36; border-bottom:1.5px solid #1F4D36; padding-bottom:4px; margin:0 0 10px 0;">
        Ministerial Jurisdiction &amp; Appointment
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tbody>
          <tr>
            <td style="padding:4px 0; width:30%; color:#4A5A4E; font-weight:500;">Primary Designation:</td>
            <td style="padding:4px 0; font-weight:bold; color:#123021;">${esc(designationLabel(r))}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Local Church / Station:</td>
            <td style="padding:4px 0; font-weight:600; color:#123021;">${esc(val(r.church))}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">District Jurisdiction:</td>
            <td style="padding:4px 0; color:#123021;">${r.district ? esc(r.district) + ' District' : '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Zonal Jurisdiction:</td>
            <td style="padding:4px 0; color:#123021;">${r.zone ? esc(r.zone) + ' Zone' : '—'}</td>
          </tr>
          ${r.otherAppointments ? `<tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Other Appointments:</td>
            <td style="padding:4px 0; color:#123021;">${esc(r.otherAppointments)}</td>
          </tr>` : ''}
        </tbody>
      </table>
    </div>

    <!-- ACADEMIC & EDUCATIONAL QUALIFICATIONS -->
    <div style="margin-bottom:22px;">
      <h2 style="font-family:Georgia, serif; font-size:13px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:#1F4D36; border-bottom:1.5px solid #1F4D36; padding-bottom:4px; margin:0 0 10px 0;">
        Academic Qualifications
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:12.5px; border:1px solid #DDD6C2;">
        <thead>
          <tr style="background:#F5F8F6; color:#1F4D36; font-weight:bold; text-transform:uppercase; font-size:10.5px; letter-spacing:0.05em;">
            <th style="padding:7px 10px; border:1px solid #DDD6C2; text-align:left; width:20%;">Level</th>
            <th style="padding:7px 10px; border:1px solid #DDD6C2; text-align:left;">Institution</th>
            <th style="padding:7px 10px; border:1px solid #DDD6C2; text-align:center; width:15%;">Year</th>
            <th style="padding:7px 10px; border:1px solid #DDD6C2; text-align:left; width:32%;">Certificate / Degree</th>
          </tr>
        </thead>
        <tbody>
          ${r.profCert ? `<tr>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; font-weight:600; color:#4A5A4E;">Professional</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;" colspan="3">${esc(r.profCert)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; font-weight:600; color:#4A5A4E;">Tertiary</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;">${esc(val(r.tertiary))}</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; text-align:center;">${esc(val(r.tertiaryDate))}</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;">${esc(val(r.tertiaryCert))}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; font-weight:600; color:#4A5A4E;">Secondary</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;">${esc(val(r.secondarySchool))}</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; text-align:center;">${esc(val(r.secondaryDate))}</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;">${esc(val(r.secondaryCert))}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; font-weight:600; color:#4A5A4E;">Primary</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;">${esc(val(r.primarySchool))}</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2; text-align:center;">${esc(val(r.primaryDate))}</td>
            <td style="padding:6px 10px; border:1px solid #DDD6C2;">${esc(val(r.primaryCert))}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- THEOLOGICAL EDUCATION -->
    <div style="margin-bottom:28px;">
      <h2 style="font-family:Georgia, serif; font-size:13px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:#1F4D36; border-bottom:1.5px solid #1F4D36; padding-bottom:4px; margin:0 0 10px 0;">
        Theological Education &amp; Training
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tbody>
          <tr>
            <td style="padding:4px 0; width:30%; color:#4A5A4E; font-weight:500;">Seminary / Bible College:</td>
            <td style="padding:4px 0; font-weight:bold; color:#123021;">${esc(val(r.theoSchool))}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Year / Period:</td>
            <td style="padding:4px 0; color:#123021;">${esc(val(r.theoDate))}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500;">Qualifications Obtained:</td>
            <td style="padding:4px 0; color:#123021;">${esc(val(r.theoCert))}</td>
          </tr>
          ${r.certificateUrls ? `<tr>
            <td style="padding:4px 0; color:#4A5A4E; font-weight:500; vertical-align:top;">Attached Certificates:</td>
            <td style="padding:4px 0; color:#123021;">
              <ul style="margin:0; padding-left:16px;">
                ${r.certificateUrls.split(',').map(url => `<li><a href="${esc(url)}" target="_blank">${esc(url)}</a></li>`).join('')}
              </ul>
            </td>
          </tr>` : ''}
        </tbody>
      </table>
    </div>

    <!-- REFERENCES / FOOTER -->
      <div style="margin-top:36px; padding-top:16px; border-top:1px solid #DDD6C2; font-size:11px; color:#4A5A4E; display:table; width:100%;">
        <div style="display:table-cell; vertical-align:middle;">
          <strong>References:</strong> Available upon request.
        </div>
        <div style="display:table-cell; vertical-align:middle; text-align:right; font-size:10px; color:#A2792B;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=FGC-MINISTER-${esc(val(r.credentialNumber))}" alt="QR" style="height:40px; margin-bottom:4px;" /><br/>
          Generated ${today}
        </div>
      </div>

    </div>
  </div>`;
}
