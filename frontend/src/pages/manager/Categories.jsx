import React, { useState, useEffect } from 'react';
import { managerService } from '../../services/managerService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await managerService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await managerService.createCategory({ ...newCat, is_active: true });
      setNewCat({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Service Categories</h1>
        <p className="text-muted">Manage available categories for service requests.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">Add New Category</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={newCat.name}
                  onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={newCat.description}
                  onChange={(e) => setNewCat({...newCat, description: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Existing Categories</h2>
          </div>
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">No categories found.</div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        {c.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description}</div>}
                      </td>
                      <td>
                        <span className={`badge ${c.is_active ? 'badge-completed' : 'badge-pending'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
