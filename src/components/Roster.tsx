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
  showToast: (msg: string) => void;
}

export default function Roster({
  records,
  onEdit,
  onDelete,
  onDownloadWord,
  onDownloadPDF,
  onDownloadAll,
  showToast,
}: RosterProps) {
  const [search, setSearch] = useState('');
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MinisterRecord | null>(null);

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.credentialNumber.toLowerCase().includes(q) ||
      (r.church && r.church.toLowerCase().includes(q)) ||
      (r.district && r.district.toLowerCase().includes(q))
    );
  });

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search records"
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="status-msg">
            {records.length > 0 && (
              search.trim()
                ? `${filtered.length} of ${records.length} record${records.length === 1 ? '' : 's'}`
                : `${records.length} record${records.length === 1 ? '' : 's'} in the register`
            )}
          </div>
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={handleZIP}
          disabled={zipLoading || !records.length}
        >
          {zipLoading ? 'Preparing ZIP…' : '↓ Download All (ZIP)'}
        </button>
      </div>

      {/* List */}
      <div className="roster">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-soft)', opacity: 0.4 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            {records.length === 0 ? (
              <>
                <h3>No records yet</h3>
                <p>Use the &ldquo;Add / Edit Entry&rdquo; tab to create your first minister record.</p>
              </>
            ) : (
              <>
                <h3>No results found</h3>
                <p>No records match &ldquo;{search}&rdquo;. Try a different search term.</p>
              </>
            )}
          </div>
        ) : (
          filtered.map((r) => (
            <div className="roster-item" key={r.id}>
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
              </div>
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}
