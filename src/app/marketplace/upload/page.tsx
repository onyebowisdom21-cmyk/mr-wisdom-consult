'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [images, setImages] = useState<string[]>(['', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Insert logic into Supabase marketplace_items table here
    alert('Product posted successfully!');
    router.push('/marketplace');
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Post Good or Service</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Product / Service Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Brand New Laptop / Web Design Service" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed specs, condition, or scope of service..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Price (₦)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 25000" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Your Contact (Phone / WhatsApp)</label>
            <input type="text" required value={sellerContact} onChange={(e) => setSellerContact(e.target.value)} placeholder="e.g. +2348089796138" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Product Image URLs (Up to 5)</label>
          {images.map((img, idx) => (
            <input key={idx} type="url" value={img} onChange={(e) => handleImageChange(idx, e.target.value)} placeholder={Image URL  (optional)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '0.5rem' }} />
          ))}
        </div>

        <button type="submit" disabled={submitting} style={{ background: '#2563eb', color: '#fff', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
          {submitting ? 'Publishing...' : 'Publish to Marketplace'}
        </button>
      </form>
    </main>
  );
}
