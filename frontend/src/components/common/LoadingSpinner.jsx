import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = "Loading...", fullScreen = false }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
      <Loader2 size={32} className="spin-animation" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
      <p style={{ fontWeight: 500 }}>{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
