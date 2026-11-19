'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function UploadProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAdminPost, setIsAdminPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).slice(0, 5);
    setSelectedFiles(filesArray);

    const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const uploadedImageUrls: string[] = [];

    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('marketplace-images')
          .upload(fileName, file);

        if (uploadError) {
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('marketplace-images')
          .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          uploadedImageUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    const { error } = await supabase.from('marketplace_items').insert([
      {
        title,
        description,
        price: Number(price),
        seller_contact: sellerContact,
        images: uploadedImageUrls,
        is_admin: isAdminPost,
      },
    ]);

    setSubmitting(false);

    if (error) {
      alert('Error posting item: ' + error.message);
    } else {
      alert('Your product/service is now live on the Marketplace!');
      router.push('/');
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Post a Product or Service</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        List your goods or professional services for visitors to discover and buy. Uploading images is optional.
      </p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Product or Service Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Web Development Service / HP EliteBook Laptop"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Full Description *</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your product specs or what your service covers..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Price (₦) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 35000"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Your Contact (Phone / WhatsApp) *</label>
            <input
              type="text"
              required
              value={sellerContact}
              onChange={(e) => setSellerContact(e.target.value)}
              placeholder="e.g. +2348089796138"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
            Upload Pictures from Your Device (Optional — Up to 5 Images)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px dashed #94a3b8', background: '#f8fafc', cursor: 'pointer' }}
          />
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {previews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
          <input type="checkbox" id="adminCheck" checked={isAdminPost} onChange={(e) => setIsAdminPost(e.target.checked)} />
          <label htmlFor="adminCheck" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
            Pin as Official Admin Listing (Displays at the top above customer listings)
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{ background: '#2563eb', color: '#fff', padding: '0.9rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
        >
          {submitting ? 'Uploading & Publishing...' : 'Publish to Marketplace'}
        </button>
      </form>
    </main>
  );
}
