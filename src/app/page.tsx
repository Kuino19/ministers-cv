'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { MinisterRecord } from '@/lib/types';
import Header from '@/components/Header';
import CVForm from '@/components/CVForm';
import Toast from '@/components/Toast';
import { downloadWord, downloadPDF } from '@/lib/export';

export default function Home() {
  const { data: session, status } = useSession();
  const [record, setRecord] = useState<MinisterRecord | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Login Form State
  const [name, setName] = useState('');
  const [credentialNumber, setCredentialNumber] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if ((session.user as any).role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        fetchMyRecord();
      }
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  async function fetchMyRecord() {
    setLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const rec = data[0];
          setRecord(rec);
          // Check if profile has actually been filled out (beyond the initial shell creation)
          const isComplete = Boolean(rec.phone || rec.email || rec.dob || rec.district);
          setViewMode(isComplete);
        }
      } else {
        showToast('Failed to load your profile.');
      }
    } catch {
      showToast('Error connecting to backend database.');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMsg(msg);
  }

  async function handleSave(data: Omit<MinisterRecord, 'id'> & { id?: string }) {
    if (data.id) {
      try {
        const res = await fetch(`/api/records/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          showToast('Profile updated successfully.');
          await fetchMyRecord();
          setViewMode(true);
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to update profile.');
        }
      } catch {
        showToast('Error connecting to server.');
      }
    }
  }

  const handleMinisterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    setIsLoggingIn(true);
    const res = await signIn('minister-login', {
      redirect: false,
      name,
      credentialNumber,
    });

    if (res?.error) {
      setLoginError(res.error);
      setIsLoggingIn(false);
    } else {
      // successful login triggers session update which runs useEffect
    }
  };

  async function handlePDF() {
    if (!record) return;
    setPdfLoading(true);
    try {
      await downloadPDF(record);
    } finally {
      setPdfLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="app">
        <Header recordCount={0} />
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-seal">M</div>
            <h1>Minister Login</h1>
            <p>Enter your name and credential number to manage your CV.</p>
          </div>
          <form onSubmit={handleMinisterLogin} className="login-form">
            {loginError && <div className="login-error">{loginError}</div>}
            
            <div className="field">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="John Doe"
              />
            </div>
            
            <div className="field">
              <label>Credential Number</label>
              <input 
                type="text" 
                value={credentialNumber} 
                onChange={e => setCredentialNumber(e.target.value.toUpperCase())} 
                required 
                placeholder="Enter your credential number"
              />
            </div>
            
            <button type="submit" className="btn btn-primary login-btn" disabled={isLoggingIn}>
              {isLoggingIn ? 'Verifying...' : 'Access My Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header recordCount={0} />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--primary)', margin: 0 }}>My CV Profile</h2>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </button>
          </div>
        </div>

        {viewMode && record ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary-dark)' }}>Profile Complete</h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '32px' }}>Your CV details have been securely saved.</p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => downloadWord(record)}>
                ↓ Download Word CV
              </button>
              <button className="btn btn-gold" onClick={handlePDF} disabled={pdfLoading}>
                {pdfLoading ? 'Working…' : '↓ Download PDF CV'}
              </button>
            </div>
            
            <div style={{ marginTop: '32px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewMode(false)}>
                ✎ Edit Profile Details
              </button>
            </div>
          </div>
        ) : (
          <CVForm
            editingRecord={record}
            onSave={handleSave}
            onClear={() => {}}
          />
        )}
      </div>
      <Toast message={toastMsg} onDone={() => setToastMsg('')} />
    </div>
  );
}
