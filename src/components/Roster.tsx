'use client';

import { useState } from 'react';
import { MinisterRecord } from '@/lib/types';
import { initials } from '@/lib/cv-template';
import StatusBadge from './StatusBadge';

interface RosterProps {
  records: MinisterRecord[];
  onEdit: (record: MinisterRecord) => void;
  onDelete: (id: string) => void;
  onDownloadWord: (record: MinisterRecord) => void;
  onDownloadPDF: (record: MinisterRecord) => void;
  onDownloadAll: () => void;
  onEmail: (record: MinisterRecord) => void;
  showToast: (msg: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export default function Roster({
  records,
  onEdit,
  onDelete,
  onDownloadWord,
  onDownloadPDF,
  onDownloadAll,
  onEmail,
  showToast,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}: RosterProps) {
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MinisterRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk Email State
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  function toggleSelection(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleAll() {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map(r => r.id)));
    }
  }

  async function handleBulkExportExcel() {
    window.open('/api/export-excel', '_blank');
  }

  async function handleSendBulkEmail(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.size === 0) return;
    
    setBulkLoading(true);
    try {
      const res = await fetch('/api/records/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordIds: Array.from(selectedIds),
          subject: bulkSubject,
          message: bulkMessage,
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Bulk email sent successfully.');
        setShowBulkEmail(false);
        setBulkSubject('');
        setBulkMessage('');
        setSelectedIds(new Set()); // Clear selection after sending
      } else {
        showToast(data.error || 'Failed to send bulk email.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    } finally {
      setBulkLoading(false);
    }
  }

  function designationLabel(r: MinisterRecord): string {
    return r.designation === 'Other' ? r.designationOther || 'Other' : r.designation;
  }

  async function handlePDF(r: MinisterRecord) {
    setPdfLoading(r.id);
    try {
      await onDownloadPDF(r);
    } finally {
      setPdfLoading(null);
    }
  }

  async function handleZIP() {
    if (!records.length) {
      showToast('No records to export yet.');
      return;
    }
    setZipLoading(true);
    try {
      await onDownloadAll();
    } finally {
      setZipLoading(false);
    }
  }

  function confirmDelete() {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="register-toolbar">
        <div className="toolbar-left">
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, credential, church…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search records"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="status-msg">
            {totalRecords} record{totalRecords === 1 ? '' : 's'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-ghost"
            onClick={handleBulkExportExcel}
          >
            📊 Export Excel
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleZIP}
            disabled={zipLoading || totalRecords === 0}
          >
            {zipLoading ? 'Preparing ZIP…' : '↓ Download All (ZIP)'}
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--primary)', color: 'white', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{selectedIds.size} record(s) selected</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-gold btn-sm" onClick={() => setShowBulkEmail(true)}>
              ✉️ Email Selected
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'white' }} onClick={() => setSelectedIds(new Set())}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="roster">
        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            {records.length === 0 ? (
              <>
                <p className="empty-title">No records yet</p>
                <p className="empty-desc">Ministers will appear here once they log in and submit their CV profile.</p>
              </>
            ) : (
              <>
                <h3>No results found</h3>
                <p>No records match &ldquo;{searchQuery}&rdquo;. Try a different search term.</p>
              </>
            )}
          </div>
        ) : (
          records.map((r) => (
            <div className="roster-item" key={r.id}>
              <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(r.id)} 
                  onChange={() => toggleSelection(r.id)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <div className="roster-seal">{initials(r.name)}</div>
              <div className="roster-info">
                <div className="r-name">{r.name || 'Unnamed'}</div>
                <div className="r-meta">
                  <span className="r-credential">{r.credentialNumber || '—'}</span>
                  <span className="r-designation">{designationLabel(r)}</span>
                  <StatusBadge status={r.status} />
                </div>
                {(r.church || r.district || r.zone) && (
                  <div className="r-meta-secondary">
                    {r.church && <span>{r.church}</span>}
                    {r.district && <span>{r.district} District</span>}
                    {r.zone && <span>{r.zone} Zone</span>}
                  </div>
                )}
                {r.certificateUrls && (
                  <div className="r-meta-secondary" style={{ marginTop: '4px' }}>
                    {r.certificateUrls.split(',').map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        Cert {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="roster-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(r)} title="Edit this record">
                  ✎ Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-danger-hover"
                  onClick={() => setDeleteTarget(r)}
                  title="Delete this record"
                >
                  ✕ Delete
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onDownloadWord(r)} title="Download Word CV">
                  ↓ Word
                </button>
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => handlePDF(r)}
                  disabled={pdfLoading === r.id}
                  title="Download PDF CV"
                >
                  {pdfLoading === r.id ? 'Working…' : '↓ PDF'}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onEmail(r)}
                  disabled={!r.email}
                  title={r.email ? `Email PDF to ${r.email}` : "No email address provided"}
                >
                  ✉️ Email
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '16px', background: 'var(--card-bg)', borderRadius: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            disabled={currentPage <= 1} 
            onClick={() => onPageChange(currentPage - 1)}
          >
            ← Previous
          </button>
          <span style={{ color: 'var(--ink-soft)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn btn-ghost btn-sm" 
            disabled={currentPage >= totalPages} 
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="confirm-dialog-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Record?</h3>
            <p>
              Are you sure you want to delete the record for <strong>{deleteTarget.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Dialog */}
      {showBulkEmail && (
        <div className="confirm-dialog-overlay" onClick={() => setShowBulkEmail(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()} style={{ width: '500px', maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: '16px' }}>Send Bulk Email</h3>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--ink-soft)' }}>
              Sending email to <strong>{selectedIds.size}</strong> selected minister(s).
            </p>
            <form onSubmit={handleSendBulkEmail}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label>Subject</label>
                <input 
                  type="text" 
                  required 
                  value={bulkSubject} 
                  onChange={e => setBulkSubject(e.target.value)} 
                  placeholder="e.g. Annual Convention Reminder"
                />
              </div>
              <div className="field" style={{ marginBottom: '24px' }}>
                <label>Message</label>
                <textarea 
                  required 
                  rows={6}
                  value={bulkMessage} 
                  onChange={e => setBulkMessage(e.target.value)} 
                  placeholder="Type your message here..."
                />
              </div>
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowBulkEmail(false)} disabled={bulkLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={bulkLoading}>
                  {bulkLoading ? 'Sending...' : 'Send Emails'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
