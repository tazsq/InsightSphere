import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              CP
            </div>
            <span className="font-semibold text-lg">InsightSphere</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">Signed in as <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name}</span></span>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2" style={{ padding: '0.375rem 0.75rem' }}>
              <LogOut size={16} />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-muted">Here is an overview of your feedback and activity.</p>
          </div>

          {user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="card flex flex-col items-center justify-center gap-4" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#e0e7ff', color: 'var(--accent)', padding: '1rem', borderRadius: '50%' }}>
                {/* Icon placeholder for Interview */}
                <svg xmlns="http://www.w3.org/-2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div>
                <h2 className="text-xl mb-2">Start a Guided Feedback Interview</h2>
                <p className="text-muted max-w-md mx-auto mb-6">
                  Share your thoughts anonymously about courses and facilities. The AI will guide you through a brief conversation to understand your experience better.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/interview')}>
                  Start Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
