'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <main className="admin-shell">
      <div className="container">
        <div className="eyebrow">Owner control panel</div>
        <h1 className="page-title">Admin dashboard</h1>
        
        <nav className="admin-nav" aria-label="Admin navigation" style={{ display: 'flex', gap: '12px', margin: '18px 0 30px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ padding: '8px 16px', background: activeTab === 'overview' ? '#1f2937' : '#e5e7eb', color: activeTab === 'overview' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('grants')}
            style={{ padding: '8px 16px', background: activeTab === 'grants' ? '#1f2937' : '#e5e7eb', color: activeTab === 'grants' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Grants
          </button>
        </nav>

        <section style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          {activeTab === 'overview' && (
            <div>
              <h2>Dashboard Overview</h2>
              <p>Welcome back, Mr Wisdom! Your live management stats and controls are active.</p>
            </div>
          )}
          {activeTab === 'grants' && (
            <div>
              <h2>Grants Management</h2>
              <p>Manage and track available grants, opportunities, and submissions here.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
