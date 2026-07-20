'use client';

import { useState, useEffect, useCallback } from 'react';
import { MinisterRecord } from '@/lib/types';
import { loadRecords, saveRecords } from '@/lib/storage';
import { downloadWord, downloadPDF, downloadAllZIP } from '@/lib/export';

import Header from '@/components/Header';
import Tabs, { TabId } from '@/components/Tabs';
import CVForm from '@/components/CVForm';
import Roster from '@/components/Roster';
import Toast from '@/components/Toast';

export default function Home() {
  const [records, setRecords] = useState<MinisterRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('form');
  const [editingRecord, setEditingRecord] = useState<MinisterRecord | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Load records on mount
  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  function persist(updated: MinisterRecord[]) {
    setRecords(updated);
    saveRecords(updated);
  }

  function showToast(msg: string) {
    setToastMsg(msg);
  }

  function handleSave(data: Omit<MinisterRecord, 'id'> & { id?: string }) {
    if (data.id) {
      // Update existing
      const updated = records.map((r) =>
        r.id === data.id ? { ...data, id: data.id } as MinisterRecord : r
      );
      persist(updated);
      showToast('Record updated.');
    } else {
      // Create new
      const newRecord: MinisterRecord = {
        ...data,
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      };
      const updated = [...records, newRecord];
      persist(updated);
      showToast('Record saved to register.');
    }
    setEditingRecord(null);
    setActiveTab('roster');
  }

  function handleEdit(record: MinisterRecord) {
    setEditingRecord(record);
    setActiveTab('form');
  }

  function handleDelete(id: string) {
    const updated = records.filter((r) => r.id !== id);
    persist(updated);
    showToast('Record deleted.');
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
