"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function UploadProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sellerContact, setSellerContact] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAdminPost, setIsAdminPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    setSelectedFiles(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Marketplace publishing is not configured.");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const uploadedImageUrls: string[] = [];

      for (const file of selectedFiles) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("marketplace-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("marketplace-images").getPublicUrl(fileName);
        if (data.publicUrl) uploadedImageUrls.push(data.publicUrl);
      }

      const { error: insertError } = await supabase.from("marketplace_items").insert({
        title,
        description,
        price: Number(price),
        seller_contact: sellerContact,
        images: uploadedImageUrls,
        is_admin: isAdminPost,
      });

      if (insertError) throw insertError;
      setSuccessMessage("Your listing has been published. You can view it in the Marketplace.");
    } catch (error) {
      console.error("Unable to publish Marketplace listing.", error);
      setErrorMessage("We couldn’t publish your listing. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="upload-shell">
      <div className="container">
        <header className="upload-header">
          <p className="eyebrow">Marketplace</p>
          <h1>Post goods or a service</h1>
          <p>
            Share a useful product or service with the community. Add clear details
            and a way for interested people to contact you.
          </p>
        </header>

        <form className="upload-form" onSubmit={handleSubmit}>
          {errorMessage && <p className="status error" role="alert">{errorMessage}</p>}
          {successMessage && (
            <p className="status" role="status">
              {successMessage} <Link className="text-link" href="/marketplace">View Marketplace →</Link>
            </p>
          )}

          <div className="field">
            <label htmlFor="listing-title">Product or service title</label>
            <input
              autoComplete="off"
              id="listing-title"
              maxLength={120}
              name="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Website design or HP EliteBook laptop…"
              required
              value={title}
            />
          </div>

          <div className="field">
            <label htmlFor="listing-description">Description</label>
            <textarea
              id="listing-description"
              maxLength={2000}
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the product or what your service includes…"
              required
              rows={5}
              value={description}
            />
          </div>

          <div className="upload-form-grid">
            <div className="field">
              <label htmlFor="listing-price">Price (₦)</label>
              <input
                autoComplete="off"
                id="listing-price"
                inputMode="decimal"
                min="0"
                name="price"
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. 35000…"
                required
                step="1"
                type="number"
                value={price}
              />
            </div>
            <div className="field">
              <label htmlFor="listing-contact">Your phone / WhatsApp contact</label>
              <input
                autoComplete="tel"
                id="listing-contact"
                maxLength={30}
                name="sellerContact"
                onChange={(event) => setSellerContact(event.target.value)}
                placeholder="e.g. +234 808 979 6138…"
                required
                type="tel"
                value={sellerContact}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="listing-images">Photos (optional, up to 5)</label>
            <input
              accept="image/*"
              className="upload-file-input"
              id="listing-images"
              multiple
              name="images"
              onChange={handleFileChange}
              type="file"
            />
            {previews.length > 0 && (
              <div className="upload-previews">
                {previews.map((src, index) => (
                  <img alt={`Preview of listing photo ${index + 1}`} height={96} key={src} src={src} width={96} />
                ))}
              </div>
            )}
          </div>

          <div className="upload-admin-toggle">
            <input
              checked={isAdminPost}
              id="adminCheck"
              name="isAdminPost"
              onChange={(event) => setIsAdminPost(event.target.checked)}
              type="checkbox"
            />
            <label htmlFor="adminCheck">
              Pin as an official admin listing (shown above community listings)
            </label>
          </div>

          <button className="upload-submit" disabled={submitting} type="submit">
            {submitting ? "Publishing…" : "Publish listing"}
          </button>
        </form>
      </div>
    </main>
  );
}
