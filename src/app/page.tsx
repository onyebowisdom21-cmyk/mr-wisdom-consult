'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    
    // Simulate or connect to your AI model endpoint powered by the full site context
    setTimeout(() => {
      setResponse(`AI Assistant Response regarding "${prompt}": Based on Mr Wisdom Tech Media and Business Consult, we provide expert technology development, business consulting, staff management, full-scale advertising, tech training (30+ courses), media production, a vibrant marketplace, and our "Book Me" expert services.`);
      setLoading(false);
      setPrompt('');
    }, 1000);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Summarized View for Site Visitors */}
      <section style={{ background: '#f8fafc', padding: '2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
        <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: '0.5rem' }}>Mr Wisdom Tech Media & Business Consult</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>Digital Innovation, Media & Business Excellence</h1>
        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          We are a comprehensive innovation hub based in Owerri, Imo State, Nigeria. We bridge the gap between advanced technology, elite business consulting, comprehensive staff management, professional media and full-scale advertising services, and community-driven commerce.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Tech & Training</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Custom web development, cloud engineering, AI, and 30+ digital courses.</p>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Consulting & Ads</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Business analysis, project management, full-scale advertising, and staff management.</p>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Media & Marketplace</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>News publishing, event coverage, community marketplace, and "Book Me" services.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/marketplace" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Visit Marketplace
          </Link>
          <Link href="/admin" style={{ background: '#0f172a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* AI Assistant Powered by Full Site Context */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ask Mr Wisdom AI Assistant</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Our AI is fully trained on our complete service catalog, consulting expertise, marketplace, and opportunities. Ask any question below!
        </p>

        <form onSubmit={handleAiQuery} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="e.g., How do I book an expert or enroll in tech training?" 
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
          />
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {response && (
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb', color: '#334155' }}>
            <strong>AI Answer:</strong> {response}
          </div>
        )}
      </section>
    </main>
  );
}
