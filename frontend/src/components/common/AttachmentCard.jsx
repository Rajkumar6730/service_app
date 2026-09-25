import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { requestService } from '../../services/requestService';

const AttachmentCard = ({ attachments }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  if (!attachments || attachments.length === 0) {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Attachments</h2>
        </div>
        <div className="card-body">
          <p className="text-muted">No attachments provided for this request.</p>
        </div>
      </div>
    );
  }

  const handleDownload = async (id, filename) => {
    try {
      setDownloadingId(id);
      await requestService.downloadAttachment(id, filename);
    } catch (err) {
      console.error("Failed to download attachment", err);
      alert("Failed to download file. It may have been deleted or you do not have permission.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h2 className="card-title">Attachments</h2>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {attachments.map((attachment) => (
            <div 
              key={attachment.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                backgroundColor: '#F9FAFB', 
                border: '1px solid var(--border)', 
                borderRadius: '0.5rem' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#E0E7FF', color: '#4F46E5', borderRadius: '0.5rem' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {attachment.filename}
                  </h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                    {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(attachment.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={() => handleDownload(attachment.id, attachment.filename)}
                disabled={downloadingId === attachment.id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              >
                <Download size={16} />
                {downloadingId === attachment.id ? 'Downloading...' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttachmentCard;
