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
          setRecord(data[0]);
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
          fetchMyRecord();
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

    const credentialRegex = /^FGCN\/\d{4}\/\d{4}\/[a-zA-Z]{3}$/;
    if (!credentialRegex.test(credentialNumber)) {
      setLoginError('Invalid format. Expected: FGCN/0000/0000/XXX');
      return;
    }

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
                placeholder="FGCN/2222/2026/OSD"
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
            {record && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => downloadWord(record)}>
                  ↓ Word CV
                </button>
                <button className="btn btn-gold btn-sm" onClick={handlePDF} disabled={pdfLoading}>
                  {pdfLoading ? 'Working…' : '↓ PDF CV'}
                </button>
              </>
            )}
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: '8px' }} onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </button>
          </div>
        </div>

        <CVForm
          editingRecord={record}
          onSave={handleSave}
          onClear={() => {}}
        />
      </div>
      <Toast message={toastMsg} onDone={() => setToastMsg('')} />
    </div>
  );
}
