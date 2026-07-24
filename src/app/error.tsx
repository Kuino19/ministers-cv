'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Inter, Arial, sans-serif',
      color: '#1B2A20',
      textAlign: 'center',
      background: '#F5F8F6',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #E8E0D0',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '28px',
        }}>
          ⚠️
        </div>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#1F4D36',
          margin: '0 0 12px',
        }}>
          Something went wrong
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#4A5A4E',
          lineHeight: '1.6',
          margin: '0 0 28px',
        }}>
          An unexpected error occurred. Please try again, or contact the administrator if the problem persists.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: '#1F4D36',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#163D2A')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#1F4D36')}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
