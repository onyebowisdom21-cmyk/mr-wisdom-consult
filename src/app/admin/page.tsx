import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <div className="container">
        <div className="eyebrow">Owner control panel</div>
        <h1 className="page-title">Admin dashboard</h1>
        
        <nav className="admin-nav" aria-label="Admin navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Link href="/admin/dashboard" className="button light">Overview</Link>
          <Link href="/admin/inquiries" className="button light">Inquiries</Link>
          <Link href="/admin/services" className="button light">Services</Link>
          <Link href="/admin/products" className="button light">Products</Link>
          <Link href="/admin/news" className="button light">News & announcements</Link>
          <Link href="/admin/scholarships" className="button light">Scholarships</Link>
          <Link href="/admin/grants" className="button light">Grants</Link>
          <Link href="/admin/jobs" className="button light">Jobs</Link>
          <Link href="/admin/empowerment" className="button light">Empowerment programs</Link>
        </nav>

        <div className="overview-section" style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2>Overview</h2>
          <p>Manage the live catalog and review incoming conversations.</p>
        </div>
      </div>
    </main>
  );
}
