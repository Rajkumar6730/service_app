import React, { useState, useEffect } from 'react';
import { managerService } from '../../services/managerService';
import { Users } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await managerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Customers</h1>
        <p className="text-muted">View all registered customers in the system.</p>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading customers..." fullScreen={false} />
        ) : customers.length === 0 ? (
          <EmptyState 
            title="No Customers Found" 
            message="There are no registered customers in the system yet."
            icon={Users}
          />
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
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

export default Customers;
