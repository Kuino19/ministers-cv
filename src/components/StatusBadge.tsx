'use client';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let className = 'status-badge';
  if (status === 'Ordained') className += ' status-ordained';
  else if (status === 'Licensed') className += ' status-licensed';
  else if (status === 'Exhorter') className += ' status-exhorter';

  return <span className={className}>{status || '—'}</span>;
}
