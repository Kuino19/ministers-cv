'use client';

import { useState, useEffect, FormEvent } from 'react';
import { MinisterRecord } from '@/lib/types';

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
      setStep(0);
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
      // Jump to step 0 (Ministerial Record) where required fields are
      if (isMobile) setStep(0);
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
    });
    resetForm();
  }

  // ---------- Section renderers ----------

  function renderStep1() {
    return (
      <div className="card">
        <div className="section-title">
          <span className="idx">1</span>
          <h2>Ministerial Record</h2>
        </div>
        <div className="grid">
          <div className="field full">
            <label>Full Name <span className="req">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rev. John A. Lawal"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <label>Credential Number <span className="req">*</span></label>
            <input
              type="text"
              value={credentialNumber}
              onChange={(e) => setCredentialNumber(e.target.value)}
              placeholder="e.g. FGCN/CR/00234"
              className={errors.credentialNumber ? 'input-error' : ''}
            />
            {errors.credentialNumber && <span className="field-error">{errors.credentialNumber}</span>}
          </div>
          <div className="field">
            <label>Designation <span className="req">*</span></label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className={errors.designation ? 'input-error' : ''}
            >
              <option value="">Select&hellip;</option>
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
              <label>Specify Designation</label>
              <input
                type="text"
                value={designationOther}
                onChange={(e) => setDesignationOther(e.target.value)}
                placeholder="Other designation"
              />
            </div>
          )}
          <div className="field full">
            <label>Status <span className="req">*</span></label>
            <div className="radio-row">
              {['Ordained', 'Licensed', 'Exhorter'].map((s) => (
                <label className="radio-opt" key={s}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
            {errors.status && <span className="field-error">{errors.status}</span>}
          </div>
          <div className="field">
            <label>Year Inducted</label>
            <input type="text" value={yearInducted} onChange={(e) => setYearInducted(e.target.value)} placeholder="YYYY" />
          </div>
          <div className="field">
            <label>Year Licensed</label>
            <input type="text" value={yearLicensed} onChange={(e) => setYearLicensed(e.target.value)} placeholder="YYYY" />
          </div>
          <div className="field">
            <label>Year Ordained</label>
            <input type="text" value={yearOrdained} onChange={(e) => setYearOrdained(e.target.value)} placeholder="YYYY" />
          </div>
          <div className="field">
            <label>District</label>
            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div className="field">
            <label>Zone</label>
            <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} />
          </div>
          <div className="field">
            <label>Church</label>
            <input type="text" value={church} onChange={(e) => setChurch(e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="card">
        <div className="section-title">
          <span className="idx">2</span>
          <h2>Personal &amp; Contact Information</h2>
        </div>
        <div className="grid">
          <div className="field">
            <label>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234…" />
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="card">
        <div className="section-title">
          <span className="idx">3</span>
          <h2>Educational Qualification</h2>
        </div>

        <div className="edu-row">
          <span className="edu-row-label">Primary School</span>
          <div className="grid">
            <div className="field">
              <label>School (if none, type N/A)</label>
              <input type="text" value={primarySchool} onChange={(e) => setPrimarySchool(e.target.value)} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="text" value={primaryDate} onChange={(e) => setPrimaryDate(e.target.value)} placeholder="e.g. 1998" />
            </div>
            <div className="field">
              <label>Certificates</label>
              <input type="text" value={primaryCert} onChange={(e) => setPrimaryCert(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="edu-row">
          <span className="edu-row-label">Secondary School</span>
          <div className="grid">
            <div className="field">
              <label>School (if none, type N/A)</label>
              <input type="text" value={secondarySchool} onChange={(e) => setSecondarySchool(e.target.value)} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="text" value={secondaryDate} onChange={(e) => setSecondaryDate(e.target.value)} placeholder="e.g. 2004" />
            </div>
            <div className="field">
              <label>Certificates</label>
              <input type="text" value={secondaryCert} onChange={(e) => setSecondaryCert(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="edu-row" style={{ marginBottom: 0 }}>
          <span className="edu-row-label">Tertiary</span>
          <div className="grid">
            <div className="field">
              <label>Institution (if none, type N/A)</label>
              <input type="text" value={tertiary} onChange={(e) => setTertiary(e.target.value)} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="text" value={tertiaryDate} onChange={(e) => setTertiaryDate(e.target.value)} placeholder="e.g. 2010" />
            </div>
            <div className="field">
              <label>Certificates</label>
              <input type="text" value={tertiaryCert} onChange={(e) => setTertiaryCert(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="card">
        <div className="section-title">
          <span className="idx">4</span>
          <h2>Theological Education</h2>
        </div>
        <div className="grid">
          <div className="field full">
            <label>Theological Schools Attended</label>
            <input type="text" value={theoSchool} onChange={(e) => setTheoSchool(e.target.value)} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="text" value={theoDate} onChange={(e) => setTheoDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Certificates</label>
            <input type="text" value={theoCert} onChange={(e) => setTheoCert(e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <form onSubmit={handleSubmit}>
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
                title={s.label}
              >
                {s.idx}
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
