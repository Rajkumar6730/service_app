import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  ClipboardList, 
  User, 
  LogOut,
  Wrench,
  Bell
} from 'lucide-react';

const TechnicianLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="nav-logo" style={{ fontSize: '1.25rem' }}>
            <Wrench size={20} />
            <span>Tech Portal</span>
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/technician" end className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/technician/requests" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <ClipboardList size={20} />
            <span>Assigned Requests</span>
          </NavLink>

          <NavLink to="/technician/notifications" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Bell size={20} />
            <span>Notifications</span>
          </NavLink>

          <div style={{ marginTop: 'auto' }}>
            <NavLink to="/technician/profile" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <User size={20} />
              <span>Profile</span>
            </NavLink>
            <button 
              onClick={logout} 
              className="sidebar-link" 
              style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '0.5rem' }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Technician</p>
            </div>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TechnicianLayout;
