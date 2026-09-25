import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ title = "No Data Found", message = "We couldn't find any data to display here.", icon: Icon = FileQuestion }) => {
  return (
    <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>{message}</p>
    </div>
  );
};

export default EmptyState;
