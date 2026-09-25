import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="public-layout">
      <main className="main-content">
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">Service Requests, Simplified.</h1>
            <p className="hero-subtitle">
              The all-in-one platform for managing customer requests, dispatching technicians, and tracking service resolutions in real-time.
            </p>
              {user ? (
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Welcome Service App🙂
                </div>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
                  <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </>
              )}
          </div>
        </section>

        <section className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Wrench size={24} />
              </div>
              <h3 className="mb-2">Easy Request Logging</h3>
              <p className="text-muted">Customers can easily create and track service requests with detailed descriptions and image uploads.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <h3 className="mb-2">Real-time Updates</h3>
              <p className="text-muted">Monitor progress as technicians accept, update, and complete tasks from their specialized dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mb-2">Management Oversight</h3>
              <p className="text-muted">Administrators have full visibility into the system to manage personnel, categories, and customer satisfaction.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
