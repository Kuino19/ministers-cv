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

  return (
    <div>
      {/* Toolbar */}
      <div className="register-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, credential, church…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="status-msg">
            {records.length
              ? `${filtered.length} of ${records.length} record${records.length === 1 ? '' : 's'}`
              : ''}
          </div>
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={handleZIP}
          disabled={zipLoading || !records.length}
        >
          {zipLoading ? 'Preparing ZIP…' : 'Download All (ZIP)'}
        </button>
      </div>

      {/* List */}
      <div className="roster">
        {filtered.length === 0 ? (
          <div className="empty-state">
            {records.length === 0 ? (
              <>
                <h3>No records yet</h3>
                <p>Entries you save will appear here, ready to export.</p>
              </>
            ) : (
              <>
                <h3>No results</h3>
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
                  <span>{r.credentialNumber || '—'}</span>
                  <span>{designationLabel(r)}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="r-meta-secondary">
                  {r.church && <span>{r.church}</span>}
                  {r.district && <span>{r.district} District</span>}
                  {r.zone && <span>{r.zone} Zone</span>}
                </div>
              </div>
              <div className="roster-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(r)}>
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-danger-hover"
                  onClick={() => {
                    if (confirm('Delete this record? This cannot be undone.')) {
                      onDelete(r.id);
                    }
                  }}
                >
                  Delete
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onDownloadWord(r)}>
                  Word
                </button>
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => handlePDF(r)}
                  disabled={pdfLoading === r.id}
                >
                  {pdfLoading === r.id ? 'Working…' : 'PDF'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
