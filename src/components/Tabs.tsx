'use client';

export type TabId = 'form' | 'roster';

interface TabsProps {
  activeTab: TabId;
  onSwitch: (tab: TabId) => void;
}

export default function Tabs({ activeTab, onSwitch }: TabsProps) {
  return (
    <div className="tabs">
      <button
        className={`tab-btn${activeTab === 'form' ? ' active' : ''}`}
        onClick={() => onSwitch('form')}
        type="button"
      >
        Add / Edit Entry
      </button>
      <button
        className={`tab-btn${activeTab === 'roster' ? ' active' : ''}`}
        onClick={() => onSwitch('roster')}
        type="button"
      >
        Register
      </button>
    </div>
  );
}
