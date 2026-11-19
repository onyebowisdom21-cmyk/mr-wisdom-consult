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

export default function MarketplaceFeed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyerContact, setBuyerContact] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data } = await supabase
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
    <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', background: '#f8fafc', padding: '1.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mr Wisdom Marketplace
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
            Products & Professional Services
          </h1>
          <p style={{ color: '#475569', margin: 0 }}>
            Browse verified products and services from Mr Wisdom Consult and our community. Post yours today!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/marketplace/upload" style={{ background: '#2563eb', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            + Post Product / Service
          </Link>
          <Link href="/services" style={{ background: '#0f172a', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Explore All Services
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Loading products and services...</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No listings yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Be the first to showcase your goods or professional services!</p>
          <Link href="/marketplace/upload" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Upload Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => {
            const hasImages = product.images && product.images.length > 0;
            return (
              <div key={product.id} style={{ border: product.is_admin ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {product.is_admin && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#2563eb', color: '#fff', padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px', fontWeight: 700, zIndex: 10 }}>
                    Official / Admin Listing
                  </span>
                )}
                <div>
                  {hasImages && (
                    <div style={{ height: '210px', background: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                      <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {product.images.length > 1 && (
                        <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(15,23,42,0.75)', color: '#fff', padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}>
                          +{product.images.length - 1} more photo{product.images.length > 2 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ padding: '1.5rem', paddingTop: (!hasImages && product.is_admin) ? '2.75rem' : '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{product.title}</h3>
                    <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </p>
                  </div>
                </div>
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>₦{Number(product.price).toLocaleString()}</span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Seller: {product.seller_contact}</span>
                  </div>
                  <button onClick={() => setSelectedProduct(product)} style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Buy / Contact Seller
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Order / Inquire: "{selectedProduct.title}"</h2>
            <p style={{ margin: '0.75rem 0', color: '#16a34a', fontWeight: 700, fontSize: '1.15rem' }}>Price: ₦{Number(selectedProduct.price).toLocaleString()}</p>

            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
                {selectedProduct.images.map((imgUrl, idx) => (
                  <img key={idx} src={imgUrl} alt={`${selectedProduct.title} ${idx + 1}`} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0 }} />
                ))}
              </div>
            )}

            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>Direct Seller Contact: <strong>{selectedProduct.seller_contact}</strong></p>

            <form onSubmit={handleContactSeller}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Or drop your phone/WhatsApp for the seller to call you:</label>
              <input type="text" required value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} placeholder="e.g. +2348000000000" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem' }} />

              {messageSent && (
                <p style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>Sent! The seller will reach out to you shortly.</p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" style={{ flex: 1, background: '#2563eb', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Submit Contact</button>
                <button type="button" onClick={() => setSelectedProduct(null)} style={{ flex: 1, background: '#e2e8f0', color: '#1e293b', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
