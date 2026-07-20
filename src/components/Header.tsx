'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
  recordCount: number;
}

export default function Header({ recordCount }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="app-header">
      <div className="app-title">
        <div className="title-row">
          <h1>Minister&rsquo;s CV Register</h1>
          <div className="header-stat">
            <span className="num">{recordCount}</span>
            <span className="lbl">Records</span>
          </div>
        </div>
        <p>Manage ministerial profiles and generate professional CVs — Word &amp; PDF</p>
      </div>

      {user && (
        <div className="user-nav">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : 'role-staff'}`}>
              {user.role}
            </span>
          </div>

          <div className="nav-actions">
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="btn btn-ghost btn-sm">
                ⚙ Manage Users
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn btn-ghost btn-sm"
              title="Sign out of register"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
