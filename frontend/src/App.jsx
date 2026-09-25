import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import ManagerLayout from './layouts/ManagerLayout';
import TechnicianLayout from './layouts/TechnicianLayout';

// Common Pages
import Notifications from './pages/common/Notifications';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/Profile';
import MyRequests from './pages/customer/MyRequests';
import CreateRequest from './pages/customer/CreateRequest';
import EditRequest from './pages/customer/EditRequest';
import CustomerRequestDetails from './pages/customer/RequestDetails';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AllRequests from './pages/manager/AllRequests';
import ManagerRequestDetails from './pages/manager/RequestDetails';
import EditManagerRequest from './pages/manager/EditManagerRequest';
import Customers from './pages/manager/Customers';
import Technicians from './pages/manager/Technicians';
import Categories from './pages/manager/Categories';
import ManagerProfile from './pages/manager/Profile';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AssignedRequests from './pages/technician/AssignedRequests';
import TechRequestDetails from './pages/technician/RequestDetails';
import TechProfile from './pages/technician/Profile';

// Temporary Placeholders for undefined routes
const Placeholder = ({ title }) => (
  <div className="card">
    <div className="card-header"><h2 className="card-title">{title}</h2></div>
    <div className="card-body">
      <p className="text-muted">This page has not been implemented yet in this phase.</p>
    </div>
  </div>
);

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to="/customer" replace />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager" replace />;
  return <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Layout */}
      <Route element={<div className="public-layout"><Navbar /><Outlet /></div>}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Auth Redirect */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Customer Protected Layout */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <CustomerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="requests/:id" element={<CustomerRequestDetails />} />
        <Route path="requests/:id/edit" element={<EditRequest />} />
        <Route path="create-request" element={<CreateRequest />} /> 
        <Route path="history" element={<Placeholder title="Service History" />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Manager Protected Layout */}
      <Route path="/manager" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <ManagerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ManagerDashboard />} />
        <Route path="requests" element={<AllRequests />} />
        <Route path="requests/:id" element={<ManagerRequestDetails />} />
        <Route path="requests/:id/edit" element={<EditManagerRequest />} />
        <Route path="customers" element={<Customers />} />
        <Route path="technicians" element={<Technicians />} />
        <Route path="categories" element={<Categories />} />
        <Route path="profile" element={<ManagerProfile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Technician Protected Layout */}
      <Route path="/technician" element={
        <ProtectedRoute allowedRoles={['TECHNICIAN']}>
          <TechnicianLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TechnicianDashboard />} />
        <Route path="requests" element={<AssignedRequests />} />
        <Route path="requests/:id" element={<TechRequestDetails />} />
        <Route path="profile" element={<TechProfile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
