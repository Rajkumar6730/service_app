import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  History, 
  Bell, 
  User, 
  LogOut,
  Wrench
} from 'lucide-react';

const CustomerLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="nav-logo" style={{ fontSize: '1.25rem' }}>
            <Wrench size={20} />
            <span>ServiceHub</span>
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/customer" end className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/customer/create-request" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <PlusCircle size={20} />
            <span>Create Request</span>
          </NavLink>
          
          <NavLink to="/customer/requests" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <ClipboardList size={20} />
            <span>My Requests</span>
          </NavLink>
          
          <NavLink to="/customer/history" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <History size={20} />
            <span>Service History</span>
          </NavLink>
          
          <NavLink to="/customer/notifications" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Bell size={20} />
            <span>Notifications</span>
          </NavLink>

          <div style={{ marginTop: 'auto' }}>
            <NavLink to="/customer/profile" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer</p>
            </div>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="dashboard-content">
          {/* This renders the matched child route (e.g. Dashboard, Profile, etc.) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
