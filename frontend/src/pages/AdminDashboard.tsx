import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, CheckCircle, BarChart2, MessageSquare, AlertTriangle, FileText, Send, Calendar, Clock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, actions, analytics, ai
  const [query, setQuery] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [meetingBrief, setMeetingBrief] = useState('');
  const [generatingBrief, setGeneratingBrief] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchActionItems();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/actions', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const json = await res.json();
      setActionItems(json);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateBrief = async () => {
    setGeneratingBrief(true);
    try {
      const res = await fetch('http://localhost:5000/api/analytics/meeting-brief', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const json = await res.json();
      setMeetingBrief(json.brief);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingBrief(false);
    }
  };

  if (loading || !data) return <div className="text-muted p-8">Loading analytics...</div>;

  const COLORS = ['#10b981', '#9ca3af', '#ef4444']; 
  const sentimentData = [
    { name: 'Positive', value: data.sentiment.positive },
    { name: 'Neutral', value: data.sentiment.neutral },
    { name: 'Negative', value: data.sentiment.negative },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold">Executive Workspace</h2>
          <p className="text-muted text-sm">Data-driven institutional insights</p>
        </div>
      </div>

      <div className="tabs">
        {['overview', 'actions', 'analytics', 'ai'].map(t => (
          <div 
            key={t}
            className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t === 'ai' ? 'AI Assistant & Reports' : t}
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <p className="text-sm text-muted font-medium mb-1 flex items-center gap-2"><MessageSquare size={16}/> Total Feedback</p>
              <h3 className="text-3xl font-bold">{data.kpis.totalSessions}</h3>
            </div>
            <div className="card">
              <p className="text-sm text-muted font-medium mb-1 flex items-center gap-2"><CheckCircle size={16}/> Analyzed</p>
              <h3 className="text-3xl font-bold text-success">{data.kpis.totalAnalyzed}</h3>
            </div>
            <div className="card">
              <p className="text-sm text-muted font-medium mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Critical Issues</p>
              <h3 className="text-3xl font-bold" style={{ color: 'var(--error)' }}>{data.kpis.criticalIssues || 0}</h3>
            </div>
            <div className="card">
              <p className="text-sm text-muted font-medium mb-1 flex items-center gap-2"><BarChart2 size={16}/> High Priority</p>
              <h3 className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{data.kpis.highIssues || 0}</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Department Breakdown</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'var(--bg-secondary)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Bar dataKey="count" fill="var(--text-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Top Issues</h3>
              <div className="flex flex-col gap-3">
                {data.topTopics.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-xs badge badge-medium">{t.count} mentions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Action Tracking</h3>
            <button className="btn btn-primary" onClick={() => alert('Implementation for New Action Item form goes here.')}>+ New Action</button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th className="py-2 font-medium text-sm">Title</th>
                <th className="py-2 font-medium text-sm">Department</th>
                <th className="py-2 font-medium text-sm">Priority</th>
                <th className="py-2 font-medium text-sm">Status</th>
                <th className="py-2 font-medium text-sm text-right">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {actionItems.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted">No action items found.</td></tr>
              ) : (
                actionItems.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-4 text-sm font-medium">{item.title}</td>
                    <td className="py-4 text-sm text-muted">{item.department}</td>
                    <td className="py-4">
                      <span className={`badge badge-${item.priority?.toLowerCase() || 'medium'}`}>{item.priority}</span>
                    </td>
                    <td className="py-4">
                      <span className={`badge badge-${item.status?.toLowerCase().replace(' ', '-') || 'open'}`}>{item.status}</span>
                    </td>
                    <td className="py-4 text-sm text-right text-muted">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Emotion Heatmap Averages</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {Object.entries(data.emotionAverages || {}).map(([emotion, val]) => (
                <div key={emotion} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div className="text-xs text-muted mb-1 capitalize">{emotion}</div>
                  <div className="text-2xl font-bold">{val as number}%</div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', marginTop: '8px', borderRadius: '2px' }}>
                    <div style={{ width: `${val}%`, height: '100%', backgroundColor: 'var(--text-primary)', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div className="card flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FileText size={18}/> AI Meeting Brief</h3>
              <button className="btn btn-secondary text-sm" onClick={handleGenerateBrief} disabled={generatingBrief}>
                {generatingBrief ? 'Generating...' : 'Generate Brief'}
              </button>
            </div>
            
            <div className="flex-1 p-4 rounded-lg overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '300px', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
              {meetingBrief ? meetingBrief : <div className="text-muted flex items-center justify-center h-full text-center">Click generate to compile a comprehensive meeting brief ready for accreditation and review.</div>}
            </div>
            {meetingBrief && (
              <button className="btn btn-secondary mt-4 print-hidden" onClick={() => window.print()}>
                Export to PDF
              </button>
            )}
          </div>

          <div className="card flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><MessageSquare size={18}/> RAG Dean Assistant</h3>
              <p className="text-xs text-muted mt-1">Queries are grounded in current institutional data context.</p>
            </div>
            
            <div className="flex-1 p-4 rounded-lg overflow-y-auto mb-4" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '300px', fontSize: '0.875rem' }}>
              {assistantAnswer ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{assistantAnswer}</div>
              ) : (
                <div className="text-muted flex items-center justify-center h-full text-center">
                  Ask me anything about the analytics, specific departments, or recent trends.
                </div>
              )}
            </div>

            <form 
              className="flex gap-2 mt-auto" 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!query.trim()) return;
                setQueryLoading(true);
                try {
                  const res = await fetch('http://localhost:5000/api/analytics/dean-assistant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                    body: JSON.stringify({ query })
                  });
                  const json = await res.json();
                  setAssistantAnswer(json.answer);
                } catch (err) {
                  console.error(err);
                } finally {
                  setQueryLoading(false);
                }
              }}
            >
              <input 
                type="text" 
                className="input flex-1" 
                placeholder="Ask a question..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={queryLoading}
              />
              <button type="submit" className="btn btn-primary" disabled={queryLoading || !query.trim()}>
                <Send size={16}/>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
