'use client';

import { useState, useEffect, FormEvent } from 'react';
import { MinisterRecord } from '@/lib/types';
import { UploadButton } from '@/lib/uploadthing';

interface CVFormProps {
  editingRecord: MinisterRecord | null;
  onSave: (record: Omit<MinisterRecord, 'id'> & { id?: string }) => void;
  onClear: () => void;
}

const STEPS = [
  { label: 'Ministerial Record', idx: '1' },
  { label: 'Personal & Contact', idx: '2' },
  { label: 'Education', idx: '3' },
  { label: 'Theological Education', idx: '4' },
];

export default function CVForm({ editingRecord, onSave, onClear }: CVFormProps) {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [credentialNumber, setCredentialNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [designationOther, setDesignationOther] = useState('');
  const [status, setStatus] = useState('');
  const [yearInducted, setYearInducted] = useState('');
  const [yearLicensed, setYearLicensed] = useState('');
  const [yearOrdained, setYearOrdained] = useState('');
  const [district, setDistrict] = useState('');
  const [zone, setZone] = useState('');
  const [church, setChurch] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [primarySchool, setPrimarySchool] = useState('');
  const [primaryDate, setPrimaryDate] = useState('');
  const [primaryCert, setPrimaryCert] = useState('');
  const [secondarySchool, setSecondarySchool] = useState('');
  const [secondaryDate, setSecondaryDate] = useState('');
  const [secondaryCert, setSecondaryCert] = useState('');
  const [tertiary, setTertiary] = useState('');
  const [tertiaryDate, setTertiaryDate] = useState('');
  const [tertiaryCert, setTertiaryCert] = useState('');
  const [theoSchool, setTheoSchool] = useState('');
  const [theoDate, setTheoDate] = useState('');
  const [theoCert, setTheoCert] = useState('');
  
  // New fields
  const [profCert, setProfCert] = useState('');
  const [otherAppointments, setOtherAppointments] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const [certificateUrls, setCertificateUrls] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (editingRecord) {
      setName(editingRecord.name || '');
      setCredentialNumber(editingRecord.credentialNumber || '');
      setDesignation(editingRecord.designation || '');
      setDesignationOther(editingRecord.designationOther || '');
      setStatus(editingRecord.status || '');
      setYearInducted(editingRecord.yearInducted || '');
      setYearLicensed(editingRecord.yearLicensed || '');
      setYearOrdained(editingRecord.yearOrdained || '');
      setDistrict(editingRecord.district || '');
      setZone(editingRecord.zone || '');
      setChurch(editingRecord.church || '');
      setDob(editingRecord.dob || '');
      setEmail(editingRecord.email || '');
      setPhone(editingRecord.phone || '');
      setPrimarySchool(editingRecord.primarySchool || '');
      setPrimaryDate(editingRecord.primaryDate || '');
      setPrimaryCert(editingRecord.primaryCert || '');
      setSecondarySchool(editingRecord.secondarySchool || '');
      setSecondaryDate(editingRecord.secondaryDate || '');
      setSecondaryCert(editingRecord.secondaryCert || '');
      setTertiary(editingRecord.tertiary || '');
      setTertiaryDate(editingRecord.tertiaryDate || '');
      setTertiaryCert(editingRecord.tertiaryCert || '');
      setTheoSchool(editingRecord.theoSchool || '');
      setTheoDate(editingRecord.theoDate || '');
      setTheoCert(editingRecord.theoCert || '');
      setProfCert(editingRecord.profCert || '');
      setOtherAppointments(editingRecord.otherAppointments || '');
      setHouseAddress(editingRecord.houseAddress || '');
      setCertificateUrls(editingRecord.certificateUrls || '');
      setStep(0);
      // Scroll to top when editing
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingRecord]);

  function resetForm() {
    setName(''); setCredentialNumber(''); setDesignation(''); setDesignationOther('');
    setStatus(''); setYearInducted(''); setYearLicensed(''); setYearOrdained('');
    setDistrict(''); setZone(''); setChurch('');
    setDob(''); setEmail(''); setPhone('');
    setPrimarySchool(''); setPrimaryDate(''); setPrimaryCert('');
    setSecondarySchool(''); setSecondaryDate(''); setSecondaryCert('');
    setTertiary(''); setTertiaryDate(''); setTertiaryCert('');
    setTheoSchool(''); setTheoDate(''); setTheoCert('');
    setProfCert(''); setOtherAppointments(''); setHouseAddress(''); setCertificateUrls('');
    setErrors({});
    setStep(0);
    onClear();
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!credentialNumber.trim()) errs.credentialNumber = 'Credential number is required.';
    if (!designation) errs.designation = 'Please select a designation.';
    if (!status) errs.status = 'Please select a status.';
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (isMobile) setStep(0);
      // Scroll to the first error
      setTimeout(() => {
        const firstError = document.querySelector('.input-error, .field-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    onSave({
      ...(editingRecord ? { id: editingRecord.id } : {}),
      name, credentialNumber, designation, designationOther,
      status, yearInducted, yearLicensed, yearOrdained,
      district, zone, church,
      dob, email, phone,
      primarySchool, primaryDate, primaryCert,
      secondarySchool, secondaryDate, secondaryCert,
      tertiary, tertiaryDate, tertiaryCert,
      theoSchool, theoDate, theoCert,
      profCert, otherAppointments, houseAddress, certificateUrls,
    });
    resetForm();
  }

  // ---------- Section renderers ----------

  function renderStep1() {
    return (
      <div className="card" key="step1">
        <div className="section-title">
          <span className="idx">1</span>
          <h2>Ministerial Record</h2>
        </div>
        <div className="grid">
          <div className="field full">
            <label htmlFor="f-name">Full Name <span className="req">*</span></label>
            <input
              id="f-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({...prev, name: ''})); }}
              placeholder="e.g. Rev. John A. Lawal"
              className={errors.name ? 'input-error' : ''}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="f-credential">Credential Number <span className="req">*</span></label>
            <input
              id="f-credential"
              type="text"
              value={credentialNumber}
              onChange={(e) => { setCredentialNumber(e.target.value); if (errors.credentialNumber) setErrors(prev => ({...prev, credentialNumber: ''})); }}
              placeholder="e.g. FGCN/CR/00234"
              className={errors.credentialNumber ? 'input-error' : ''}
            />
            {errors.credentialNumber && <span className="field-error">{errors.credentialNumber}</span>}
          </div>
          <div className="field">
            <label htmlFor="f-designation">Designation <span className="req">*</span></label>
            <select
              id="f-designation"
              value={designation}
              onChange={(e) => { setDesignation(e.target.value); if (errors.designation) setErrors(prev => ({...prev, designation: ''})); }}
              className={errors.designation ? 'input-error' : ''}
            >
              <option value="">Select…</option>
              <option>District Overseer</option>
              <option>Zonal Superintendent</option>
              <option>Senior Pastor</option>
              <option>Pastor in Charge</option>
              <option>Assisting Minister</option>
              <option value="Other">Other</option>
            </select>
            {errors.designation && <span className="field-error">{errors.designation}</span>}
          </div>
          {designation === 'Other' && (
            <div className="field">
              <label htmlFor="f-designation-other">Specify Designation</label>
              <input
                id="f-designation-other"
                type="text"
                value={designationOther}
                onChange={(e) => setDesignationOther(e.target.value)}
                placeholder="Other designation"
                autoFocus
              />
            </div>
          )}
          <div className="field full">
            <label>Status <span className="req">*</span></label>
            <div className="radio-row" role="group" aria-label="Ministerial Status">
              {['Ordained', 'Licensed', 'Exhorter'].map((s) => {
                const isChecked = status.includes(s);
                return (
                  <label className={`radio-opt${isChecked ? ' radio-opt-checked' : ''}`} key={s}>
                    <input
                      type="checkbox"
                      name="status"
                      value={s}
                      checked={isChecked}
                      onChange={(e) => {
                        const currentList = status.split(',').map(x => x.trim()).filter(Boolean);
                        const newList = e.target.checked 
                          ? [...currentList, s] 
                          : currentList.filter(x => x !== s);
                        setStatus(newList.join(', '));
                        if (errors.status) setErrors(prev => ({...prev, status: ''}));
                      }}
                    />
                    <span>{s}</span>
                  </label>
                );
              })}
            </div>
            {errors.status && <span className="field-error">{errors.status}</span>}
          </div>
          <div className="field full">
            <label htmlFor="f-other-appointments">Other Notable Ministerial Appointments</label>
            <textarea
              id="f-other-appointments"
              value={otherAppointments}
              onChange={(e) => setOtherAppointments(e.target.value)}
              placeholder="List any other notable appointments here..."
              rows={3}
            />
          </div>
          <div className="field">
            <label htmlFor="f-year-inducted">Year Inducted</label>
            <input id="f-year-inducted" type="text" value={yearInducted} onChange={(e) => setYearInducted(e.target.value)} placeholder="YYYY" inputMode="numeric" maxLength={4} />
          </div>
          <div className="field">
            <label htmlFor="f-year-licensed">Year Licensed</label>
            <input id="f-year-licensed" type="text" value={yearLicensed} onChange={(e) => setYearLicensed(e.target.value)} placeholder="YYYY" inputMode="numeric" maxLength={4} />
          </div>
          <div className="field">
            <label htmlFor="f-year-ordained">Year Ordained</label>
            <input id="f-year-ordained" type="text" value={yearOrdained} onChange={(e) => setYearOrdained(e.target.value)} placeholder="YYYY" inputMode="numeric" maxLength={4} />
          </div>
          <div className="field">
            <label htmlFor="f-district">District</label>
            <input id="f-district" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-zone">Zone</label>
            <input id="f-zone" type="text" value={zone} onChange={(e) => setZone(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-church">Church</label>
            <input id="f-church" type="text" value={church} onChange={(e) => setChurch(e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="card" key="step2">
        <div className="section-title">
          <span className="idx">2</span>
          <h2>Personal &amp; Contact Information</h2>
        </div>
        <div className="grid">
          <div className="field">
            <label htmlFor="f-dob">Date of Birth</label>
            <input id="f-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-email">Email</label>
            <input id="f-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="f-phone">Phone</label>
            <input id="f-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234…" autoComplete="tel" />
          </div>
          <div className="field full">
            <label htmlFor="f-address">House Address</label>
            <textarea id="f-address" value={houseAddress} onChange={(e) => setHouseAddress(e.target.value)} rows={2} />
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="card" key="step3">
        <div className="section-title">
          <span className="idx">3</span>
          <h2>Educational Qualification</h2>
        </div>

        <div className="edu-row">
          <span className="edu-row-label">Primary School</span>
          <div className="grid">
            <div className="field">
              <label htmlFor="f-pri-school">School (if none, type N/A)</label>
              <input id="f-pri-school" type="text" value={primarySchool} onChange={(e) => setPrimarySchool(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-pri-date">Date</label>
              <input id="f-pri-date" type="text" value={primaryDate} onChange={(e) => setPrimaryDate(e.target.value)} placeholder="e.g. 1998" />
            </div>
            <div className="field">
              <label htmlFor="f-pri-cert">Certificates</label>
              <input id="f-pri-cert" type="text" value={primaryCert} onChange={(e) => setPrimaryCert(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="edu-row">
          <span className="edu-row-label">Secondary School</span>
          <div className="grid">
            <div className="field">
              <label htmlFor="f-sec-school">School (if none, type N/A)</label>
              <input id="f-sec-school" type="text" value={secondarySchool} onChange={(e) => setSecondarySchool(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-sec-date">Date</label>
              <input id="f-sec-date" type="text" value={secondaryDate} onChange={(e) => setSecondaryDate(e.target.value)} placeholder="e.g. 2004" />
            </div>
            <div className="field">
              <label htmlFor="f-sec-cert">Certificates</label>
              <input id="f-sec-cert" type="text" value={secondaryCert} onChange={(e) => setSecondaryCert(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="edu-row" style={{ marginBottom: 0 }}>
          <span className="edu-row-label">Tertiary</span>
          <div className="grid">
            <div className="field">
              <label htmlFor="f-tert-school">Institution (if none, type N/A)</label>
              <input id="f-tert-school" type="text" value={tertiary} onChange={(e) => setTertiary(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-tert-date">Date</label>
              <input id="f-tert-date" type="text" value={tertiaryDate} onChange={(e) => setTertiaryDate(e.target.value)} placeholder="e.g. 2010" />
            </div>
            <div className="field">
              <label htmlFor="f-tert-cert">Certificates</label>
              <input id="f-tert-cert" type="text" value={tertiaryCert} onChange={(e) => setTertiaryCert(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="edu-row" style={{ marginBottom: 0 }}>
          <span className="edu-row-label">Professional Certification</span>
          <div className="grid">
            <div className="field full">
              <label htmlFor="f-prof-cert">Certifications</label>
              <input id="f-prof-cert" type="text" value={profCert} onChange={(e) => setProfCert(e.target.value)} placeholder="e.g. ICAN, CIPM..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="card" key="step4">
        <div className="section-title">
          <span className="idx">4</span>
          <h2>Theological Education</h2>
        </div>
        <div className="grid">
          <div className="field full">
            <label htmlFor="f-theo-school">Theological Schools Attended</label>
            <input id="f-theo-school" type="text" value={theoSchool} onChange={(e) => setTheoSchool(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-theo-date">Date</label>
            <input id="f-theo-date" type="text" value={theoDate} onChange={(e) => setTheoDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-theo-cert">Certificates</label>
            <input id="f-theo-cert" type="text" value={theoCert} onChange={(e) => setTheoCert(e.target.value)} />
          </div>
        </div>

        <div className="edu-row" style={{ marginTop: '24px', marginBottom: 0 }}>
          <span className="edu-row-label">Upload Certificates</span>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
            Upload scans or photos of your certificates (Max 4MB each, up to 4 files).
          </p>
          <div style={{ padding: '16px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px dashed var(--line)' }}>
            <UploadButton
              endpoint="certificateUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  const newUrls = res.map(f => f.url);
                  const currentUrls = certificateUrls ? certificateUrls.split(',') : [];
                  setCertificateUrls([...currentUrls, ...newUrls].join(','));
                  alert("Upload Completed successfully");
                }
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
            {certificateUrls && (
              <div style={{ marginTop: '16px', fontSize: '13px' }}>
                <strong>Uploaded ({certificateUrls.split(',').length} file(s)):</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  {certificateUrls.split(',').map((url, i) => (
                    <li key={i}><a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View File {i + 1}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Editing banner */}
      {editingRecord && (
        <div className="editing-banner">
          <span className="banner-text">✎ Editing: {editingRecord.name}</span>
          <button type="button" className="btn btn-ghost btn-sm banner-cancel" onClick={resetForm}>
            Cancel
          </button>
        </div>
      )}

      {/* Progress bar (mobile only) */}
      {isMobile && (
        <div className="step-progress">
          <div className="step-progress-bar">
            {STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                className={`step-dot${step === i ? ' active' : ''}${step > i ? ' done' : ''}`}
                onClick={() => setStep(i)}
                aria-label={`Step ${s.idx}: ${s.label}`}
                title={s.label}
              >
                {step > i ? '✓' : s.idx}
              </button>
            ))}
            <div
              className="step-progress-fill"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="step-label">
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </div>
        </div>
      )}

      {/* Sections */}
      {isMobile ? (
        stepRenderers[step]()
      ) : (
        stepRenderers.map((render, i) => (
          <div key={i}>{render()}</div>
        ))
      )}

      {/* Navigation */}
      <div className="form-actions">
        {isMobile && step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={resetForm}>
          Clear Form
        </button>
        {isMobile && step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Next →
          </button>
        ) : (
          <button type="submit" className="btn btn-primary">
            {editingRecord ? 'Update Record' : 'Save to Register'}
          </button>
        )}
      </div>
    </form>
  );
}
