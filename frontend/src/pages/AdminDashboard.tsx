import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, BarChart2, MessageSquare } from 'lucide-react';

interface DashboardData {
  kpis: {
    totalSessions: number;
    totalAnalyzed: number;
    averageAuthenticity: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topTopics: { name: string; count: number }[];
  departmentBreakdown: { name: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // AI Dean Assistant state
  const [query, setQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading || !data) {
    return <div className="text-muted">Loading analytics...</div>;
  }

  const sentimentData = [
    { name: 'Positive', value: data.sentiment.positive },
    { name: 'Neutral', value: data.sentiment.neutral },
    { name: 'Negative', value: data.sentiment.negative },
  ];
  const COLORS = ['#10b981', '#9ca3af', '#ef4444']; // Green, Gray, Red

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Analytics Overview</h2>
          <p className="text-muted text-sm">Real-time feedback insights</p>
        </div>
        <button 
          className="btn btn-secondary flex items-center gap-2 print-hidden"
          onClick={() => window.print()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card flex items-center justify-between" style={{ padding: '1.5rem' }}>
          <div>
            <p className="text-sm text-muted font-medium mb-1">Total Feedback</p>
            <h3 className="text-2xl font-bold">{data.kpis.totalSessions}</h3>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#e0e7ff', color: 'var(--accent)', borderRadius: '12px' }}>
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="card flex items-center justify-between" style={{ padding: '1.5rem' }}>
          <div>
            <p className="text-sm text-muted font-medium mb-1">Analyzed Sessions</p>
            <h3 className="text-2xl font-bold">{data.kpis.totalAnalyzed}</h3>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#10b981', borderRadius: '12px' }}>
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="card flex items-center justify-between" style={{ padding: '1.5rem' }}>
          <div>
            <p className="text-sm text-muted font-medium mb-1">Avg Authenticity</p>
            <h3 className="text-2xl font-bold">{data.kpis.averageAuthenticity}/100</h3>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#f3e8ff', color: '#a855f7', borderRadius: '12px' }}>
            <BarChart2 size={20} />
          </div>
        </div>

      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Top Topics Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Feedback Topics</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topTopics} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} />
                <Tooltip cursor={{fill: 'var(--bg-secondary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {sentimentData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm text-muted">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Breakdown Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Responses by Department</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'var(--bg-secondary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Dean Assistant */}
      <div className="card mt-4" style={{ border: '1px solid var(--accent)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Dean Assistant</h3>
            <p className="text-xs text-muted">Ask questions about your institutional data in plain language.</p>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', minHeight: '100px', marginBottom: '1rem' }}>
          {assistantAnswer ? (
            <div style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>{assistantAnswer}</div>
          ) : (
            <div className="text-muted text-sm flex items-center justify-center h-full">
              Your AI insights will appear here. Try asking "What are our top complaints?"
            </div>
          )}
        </div>

        <form 
          className="flex gap-3" 
          onSubmit={async (e) => {
            e.preventDefault();
            if (!query.trim()) return;
            setQueryLoading(true);
            try {
              const res = await fetch('http://localhost:5000/api/analytics/dean-assistant', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ query })
              });
              const data = await res.json();
              setAssistantAnswer(data.answer);
            } catch (err) {
              console.error(err);
            } finally {
              setQueryLoading(false);
            }
          }}
        >
          <input 
            type="text" 
            className="input" 
            style={{ flex: 1 }} 
            placeholder="e.g., Which department has the most negative feedback?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={queryLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={queryLoading || !query.trim()}>
            {queryLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminDashboard;
