'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Form states for creating new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Failed to load users');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <div className="title-row">
            <h1>User Management</h1>
            <Link href="/" className="btn btn-ghost btn-sm">
              ← Back to Register
            </Link>
          </div>
          <p>Create and manage staff accounts for office access</p>
        </div>
      </header>

      {toastMsg && <div className="toast show">{toastMsg}</div>}

      <div className="admin-grid">
        {/* Create User Form */}
        <div className="card">
          <div className="section-title">
            <h2>Add New Staff Account</h2>
          </div>
          <form onSubmit={handleCreateUser} className="admin-form">
            <div className="field">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Samuel Ade"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="s.ade@church.org"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Initial password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="STAFF">STAFF (Can add/edit records)</option>
                <option value="ADMIN">ADMIN (Full access + manage users)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create User Account'}
            </button>
          </form>
        </div>

        {/* Existing Users List */}
        <div className="card">
          <div className="section-title">
            <h2>System Accounts</h2>
          </div>
          {loading ? (
            <p>Loading accounts…</p>
          ) : error ? (
            <p className="field-error">{error}</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name &amp; Email</th>
                  <th>Role</th>
                  <th>Records</th>
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
                    <td>{u._count?.records ?? 0}</td>
                    <td>
                      {u.id !== currentUser?.id ? (
                        <button
                          className="btn btn-ghost btn-sm btn-danger-hover"
                          onClick={() => handleDeleteUser(u)}
                        >
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
          )}
        </div>
      </div>
    </div>
  );
}
