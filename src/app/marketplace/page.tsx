'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  seller_contact: string;
  is_admin: boolean;
  created_at: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyerContact, setBuyerContact] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('is_admin', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const handleContactSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setBuyerContact('');
      setSelectedProduct(null);
    }, 3000);
  };

  return (
    <main className="marketplace-shell" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="eyebrow" style={{ color: '#2563eb', fontWeight: 600 }}>Mr Wisdom Consult</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Community Marketplace</h1>
          <p style={{ color: '#6b7280' }}>Discover goods & services from verified admins and trusted users.</p>
        </div>
        <Link href="/marketplace/upload" className="button primary" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          + Post Your Good / Service
        </Link>
      </div>

      {loading ? (
        <p>Loading marketplace items...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>No items posted in the marketplace yet. Be the first to post!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              {product.is_admin && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#2563eb', color: '#fff', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '20px', fontWeight: 600, zIndex: 10 }}>
                  Admin Featured
                </span>
              )}
              <div style={{ height: '200px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {product.images && product.images[0] ? (
                  <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#9ca3af' }}>No Image Available</span>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{product.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>₦{Number(product.price).toLocaleString()}</span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Contact: {product.seller_contact}</span>
                </div>
                <button onClick={() => setSelectedProduct(product)} style={{ width: '100%', background: '#111827', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Buy / Drop Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h2>Interested in "{selectedProduct.title}"?</h2>
            <p style={{ margin: '1rem 0', color: '#4b5563' }}>Price: ₦{Number(selectedProduct.price).toLocaleString()}</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>Seller Contact: <strong>{selectedProduct.seller_contact}</strong></p>
            
            <form onSubmit={handleContactSeller}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Drop your phone number/email for the seller:</label>
              <input type="text" required value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} placeholder="e.g. +2348000000000" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '1rem' }} />
              
              {messageSent && (
                <p style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>Sent successfully! The seller will reach you shortly.</p>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ flex: 1, background: '#2563eb', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Submit Contact</button>
                <button type="button" onClick={() => setSelectedProduct(null)} style={{ flex: 1, background: '#e5e7eb', color: '#1f2937', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
