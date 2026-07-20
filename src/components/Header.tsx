'use client';

interface HeaderProps {
  recordCount: number;
}

export default function Header({ recordCount }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-title">
        <h1>Minister&rsquo;s CV Register</h1>
        <p>Collate ministerial biodata and generate formatted CVs — Word &amp; PDF</p>
      </div>
      <div className="header-stat">
        <div className="num">{recordCount}</div>
        <div className="lbl">Records saved</div>
      </div>
    </header>
  );
}
