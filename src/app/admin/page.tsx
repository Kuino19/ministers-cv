'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MinisterRecord } from '@/lib/types';
import { downloadWord, downloadPDF, downloadAllZIP } from '@/lib/export';
import Roster from '@/components/Roster';
import Tabs, { TabId } from '@/components/Tabs';
import CVForm from '@/components/CVForm';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: { records: number };
}

export default function AdminPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [records, setRecords] = useState<MinisterRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  
  // Custom Tabs logic for Admin (we could use the Tabs component but it was hardcoded for 'form' vs 'roster')
  // We'll just build a simple tab switcher here.
  const [activeTab, setActiveTab] = useState<'roster' | 'users'>('roster');

  // Form states for creating new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [submitting, setSubmitting] = useState(false);

  // Minister Edit/Create States
  const [editingRecord, setEditingRecord] = useState<MinisterRecord | null>(null);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRecords();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchRecords() {
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } finally {
      setLoadingRecords(false);
    }
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`User ${data.name} created successfully.`);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('STAFF');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch {
      alert('Error creating user');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(user: UserItem) {
    if (!confirm(`Delete user account for ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('User deleted.');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch {
      alert('Error deleting user');
    }
  }

  async function handleDeleteRecord(id: string) {
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Record deleted from database.');
        fetchRecords();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to delete record.');
      }
    } catch {
      showToast('Error connecting to server.');
    }
  }

  async function handleSaveAdmin(data: Omit<MinisterRecord, 'id'> & { id?: string }) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/records/${data.id}` : `/api/records`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast('Minister record saved successfully.');
        setEditingRecord(null);
        setIsCreatingRecord(false);
        fetchRecords();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to save record.');
      }
    } catch {
      showToast('Error connecting to server.');
    }
  }

  const handleDownloadWord = useCallback((r: MinisterRecord) => {
    downloadWord(r);
    showToast('Word CV downloaded.');
  }, []);

  const handleDownloadPDF = useCallback(async (r: MinisterRecord) => {
    await downloadPDF(r);
    showToast('PDF CV downloaded.');
  }, []);

  const handleDownloadAll = useCallback(async () => {
    await downloadAllZIP(records);
    showToast('All CVs downloaded as ZIP.');
  }, [records]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <div className="title-row">
            <h1>Admin Portal</h1>
            <div className="header-stat">
              <span className="user-name" style={{ marginRight: '16px', fontSize: '14px' }}>{currentUser?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-ghost btn-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
          <p>Manage minister CV records and system accounts</p>
        </div>
      </header>

      <div className="tabs" style={{ maxWidth: '1000px', margin: '0 auto 20px auto', display: 'flex', gap: '8px', padding: '0 20px' }}>
        <button 
          className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
          style={{ flex: 1, padding: '12px', background: activeTab === 'roster' ? 'var(--primary)' : 'var(--card)', color: activeTab === 'roster' ? '#fff' : 'var(--ink)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}
        >
          Minister CV Database
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ flex: 1, padding: '12px', background: activeTab === 'users' ? 'var(--primary)' : 'var(--card)', color: activeTab === 'users' ? '#fff' : 'var(--ink)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}
        >
          System Accounts
        </button>
      </div>

      {toastMsg && <div className="toast show">{toastMsg}</div>}

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {activeTab === 'roster' && !editingRecord && !isCreatingRecord && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button className="btn btn-primary" onClick={() => setIsCreatingRecord(true)}>
                + Create New Minister CV
              </button>
            </div>
            <Roster
              records={records}
              onEdit={(r) => setEditingRecord(r)}
            onDelete={handleDeleteRecord}
            onDownloadWord={handleDownloadWord}
            onDownloadPDF={handleDownloadPDF}
            onDownloadAll={handleDownloadAll}
            showToast={showToast}
          />
          </>
        )}

        {(editingRecord || isCreatingRecord) && (
          <div className="card" style={{ position: 'relative' }}>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}
              onClick={() => { setEditingRecord(null); setIsCreatingRecord(false); }}
            >
              ✕ Cancel
            </button>
            <div style={{ padding: '0 24px' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--primary)', marginBottom: '24px', marginTop: '24px' }}>
                {editingRecord ? 'Editing Minister CV' : 'Create New Minister CV'}
              </h2>
            </div>
            <CVForm
              editingRecord={editingRecord || undefined}
              onSave={handleSaveAdmin}
              onClear={() => {}}
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card">
              <div className="section-title">
                <h2>Add New Admin/Staff</h2>
              </div>
              <form onSubmit={handleCreateUser} className="admin-form">
                <div className="field">
                  <label>Full Name *</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Email Address *</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Password *</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Role</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              </form>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
              <div className="section-title">
                <h2>System Accounts</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name &amp; Email</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="u-name">{u.name}</div>
                          <div className="u-email">{u.email}</div>
                        </td>
                        <td>
                          <span className={`role-badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-staff'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.id !== currentUser?.id ? (
                            <button className="btn btn-ghost btn-sm btn-danger-hover" onClick={() => handleDeleteUser(u)}>
                              Delete
                            </button>
                          ) : (
                            <span className="u-current">(You)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
