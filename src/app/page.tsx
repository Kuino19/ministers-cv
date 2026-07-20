'use client';

import { useState, useEffect, useCallback } from 'react';
import { MinisterRecord } from '@/lib/types';
import { downloadWord, downloadPDF, downloadAllZIP } from '@/lib/export';

import Header from '@/components/Header';
import Tabs, { TabId } from '@/components/Tabs';
import CVForm from '@/components/CVForm';
import Roster from '@/components/Roster';
import Toast from '@/components/Toast';

export default function Home() {
  const [records, setRecords] = useState<MinisterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('form');
  const [editingRecord, setEditingRecord] = useState<MinisterRecord | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Fetch records from API on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        showToast('Failed to load database records.');
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
      // Update existing record via API
      try {
        const res = await fetch(`/api/records/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          showToast('Record updated in database.');
          fetchRecords();
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to update record.');
        }
      } catch {
        showToast('Error connecting to server.');
      }
    } else {
      // Create new record via API
      try {
        const res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          showToast('Record saved to office database.');
          fetchRecords();
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to save record.');
        }
      } catch {
        showToast('Error connecting to server.');
      }
    }
    setEditingRecord(null);
    setActiveTab('roster');
  }

  function handleEdit(record: MinisterRecord) {
    setEditingRecord(record);
    setActiveTab('form');
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });

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

  function handleClear() {
    setEditingRecord(null);
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
      <Header recordCount={records.length} />
      <Tabs activeTab={activeTab} onSwitch={setActiveTab} />

      {activeTab === 'form' && (
        <CVForm
          editingRecord={editingRecord}
          onSave={handleSave}
          onClear={handleClear}
        />
      )}

      {activeTab === 'roster' && (
        <Roster
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownloadWord={handleDownloadWord}
          onDownloadPDF={handleDownloadPDF}
          onDownloadAll={handleDownloadAll}
          showToast={showToast}
        />
      )}

      <Toast message={toastMsg} onDone={() => setToastMsg('')} />
    </div>
  );
}
