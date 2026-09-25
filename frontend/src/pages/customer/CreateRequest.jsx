import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';
import { requestService } from '../../services/requestService';
import Alert from '../../components/common/Alert';

const CreateRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: 1, // Defaulting to 1 since we don't have dynamic categories yet
    priority: 'MEDIUM',
    address: ''
  });
  const [attachment, setAttachment] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.name === 'category_id' ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic client-side validation
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use FormData for multipart/form-data payload
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category_id', formData.category_id);
      payload.append('priority', formData.priority);
      payload.append('address', formData.address);

      if (attachment) {
        payload.append('attachment', attachment);
      }

      await requestService.createRequest(payload);
      setSuccess('Service request created successfully!');

      // Clear form
      setFormData({
        title: '',
        description: '',
        category_id: 1,
        priority: 'MEDIUM',
        address: ''
      });
      setAttachment(null);

      // Redirect to My Requests after 1.5 seconds
      setTimeout(() => {
        navigate('/customer/requests');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create request. Ensure your file type is valid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Create New Request</h1>
        <p className="text-muted">Fill out the details below to log a new service request.</p>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <div className="card-header">
          <h2 className="card-title">Request Details</h2>
        </div>

        <div className="card-body">
          <Alert type="error" message={error} />
          <Alert type="success" message={success ? `${success} Redirecting...` : ''} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select name="category_id" className="form-control" value={formData.category_id} onChange={handleChange} disabled={isLoading}>
                <option value={1}>General Maintenance (ID: 1)</option>
                <option value={2}>Plumbing (ID: 2)</option>
                <option value={3}>Electrical (ID: 3)</option>
                <option value={4}>Painting (ID: 4)</option>
                <option value={5}>Carpentry (ID: 5)</option>
                <option value={6}>Appliance Repair (ID: 6)</option>
                <option value={7}>HVAC (ID: 7)</option>
                <option value={8}>Cleaning (ID: 8)</option>
                <option value={9}>Pest Control (ID: 9)</option>
                <option value={10}>Other (ID: 10)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. Broken AC Unit"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Please describe the issue in detail..."
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isLoading}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Attachment (Optional)</label>
              <div
                style={{
                  border: '2px dashed var(--border)',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  backgroundColor: '#F9FAFB',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                {attachment ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={32} color="var(--primary)" />
                    <p style={{ fontWeight: 500, margin: 0 }}>{attachment.name}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>Click to upload an image or document</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>PNG, JPG, PDF up to 5MB</p>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" className="form-control" value={formData.priority} onChange={handleChange} disabled={isLoading}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Enter service location address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
              <Link to="/customer/requests" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
