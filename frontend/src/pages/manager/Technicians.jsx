import React, { useState, useEffect } from 'react';
import { managerService } from '../../services/managerService';
import { Wrench, Trash2, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    experience: '',
    availability: 'Available'
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const data = await managerService.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error("Failed to load technicians", err);
      setError("Failed to load technicians.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(error) setError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await managerService.addTechnician(formData);
      setIsAdding(false);
      setFormData({ name: '', email: '', phone: '', password: '', specialization: '', experience: '', availability: 'Available' });
      fetchTechnicians();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add technician.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this technician?")) {
      try {
        await managerService.removeTechnician(id);
        fetchTechnicians();
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to remove technician.");
      }
    }
  };

  return (
    <div>
      <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Technicians</h1>
          <p className="text-muted">Manage service technicians.</p>
        </div>
        {technicians.length < 6 ? (
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Technician
          </button>
        ) : (
          <div style={{ color: '#B91C1C', fontWeight: 600, padding: '0.5rem 1rem', backgroundColor: '#FEE2E2', borderRadius: '0.25rem' }}>
            Maximum limit of 6 technicians reached.
          </div>
        )}
      </div>

      <Alert type="error" message={error} />

      {isAdding && technicians.length < 6 && (
        <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="card-header">
            <h2 className="card-title">Add New Technician</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required disabled={submitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required disabled={submitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} disabled={submitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required disabled={submitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} disabled={submitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience</label>
                <input type="text" name="experience" className="form-control" value={formData.experience} onChange={handleChange} disabled={submitting} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Save Technician'}
                </button>
                <button type="button" className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading technicians..." fullScreen={false} />
        ) : technicians.length === 0 ? (
          <EmptyState 
            title="No Technicians Found" 
            message="No technicians found. Please create technician accounts."
            icon={Wrench}
          />
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tech ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.id}</td>
                    <td>{t.user.name}</td>
                    <td>{t.user.email}</td>
                    <td>{t.specialization || 'General'}</td>
                    <td>{t.experience || 'N/A'}</td>
                    <td>
                      <span className={`badge ${t.availability === 'Available' ? 'badge-completed' : 'badge-pending'}`}>
                        {t.availability}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn" 
                        onClick={() => handleRemove(t.id)}
                        style={{ padding: '0.25rem 0.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}
                        title="Remove Technician"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Technicians;
