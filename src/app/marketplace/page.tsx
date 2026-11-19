"use client";

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";

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

function formatPrice(price: number): string {
  return `₦${new Intl.NumberFormat("en-NG").format(Number(price) || 0)}`;
}

function sellerInquiryUrl(product: Product, buyerContact: string): string | null {
  const sellerContact = product.seller_contact.trim();
  const message = `Hello, I’m interested in “${product.title}”. My contact is ${buyerContact}.`;
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(sellerContact)) {
    return `mailto:${sellerContact}?subject=${encodeURIComponent(`Marketplace inquiry: ${product.title}`)}&body=${encodeURIComponent(message)}`;
  }
  const digits = sellerContact.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const whatsappNumber = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function MarketplacePage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyerContact, setBuyerContact] = useState("");
  const [contactUrl, setContactUrl] = useState<string | null>(null);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedProduct && dialog && !dialog.open) dialog.showModal();
    if (!selectedProduct && dialog?.open) dialog.close();
  }, [selectedProduct]);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      setLoading(true);
      setLoadError(false);
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Marketplace data is not configured.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from("marketplace_items")
          .select("*")
          .order("is_admin", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (active) setProducts((data ?? []) as Product[]);
      } catch (error) {
        console.error("Unable to load Marketplace listings.", error);
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchProducts();
    return () => { active = false; };
  }, [retryCount]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.title} ${product.description}`.toLocaleLowerCase().includes(normalized),
    );
  }, [products, query]);

  const handleContactSeller = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) return;
    const url = sellerInquiryUrl(selectedProduct, buyerContact.trim());
    if (!url) {
      setContactError("We couldn’t create a message link. Please use the seller contact shown above.");
      return;
    }
    setContactError("");
    setContactUrl(url);
  };

  const closeInquiry = () => {
    setSelectedProduct(null);
    setBuyerContact("");
    setContactUrl(null);
    setContactError("");
  };

  return (
    <main className="marketplace-shell">
      <div className="container">
        <header className="marketplace-header">
          <div className="marketplace-header-copy">
            <p className="eyebrow">Community commerce &amp; trusted services</p>
            <h1>Marketplace</h1>
            <p>Discover goods and services from Mr Wisdom Consult and the community. Browse, connect, and find what you need.</p>
          </div>
          <div className="marketplace-header-actions">
            <Link className="button" href="/marketplace/upload">Post goods / Book Me</Link>
            <Link className="button secondary" href="/services">Book a service</Link>
          </div>
        </header>

        <div className="marketplace-filter">
          <label htmlFor="marketplace-search">
            Search listings
            <input
              autoComplete="off"
              id="marketplace-search"
              name="q"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by item or service…"
              type="search"
              value={query}
            />
          </label>
          {!loading && !loadError && (
            <p aria-live="polite">
              {filteredProducts.length} {filteredProducts.length === 1 ? "listing" : "listings"}
            </p>
          )}
        </div>

        {loading ? (
          <p className="status" role="status">Loading listings…</p>
        ) : loadError ? (
          <div className="marketplace-empty" role="alert">
            <h2>Listings are temporarily unavailable</h2>
            <p>Please try again. You can still browse services or contact the consultancy.</p>
            <div className="marketplace-header-actions">
              <button onClick={() => setRetryCount((count) => count + 1)} type="button">Try again</button>
              <Link className="button secondary" href="/contact">Contact us</Link>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="marketplace-empty">
            <h2>{products.length ? "No matching listings" : "Be the first to post"}</h2>
            <p>
              {products.length
                ? "Try another search, or clear the search field to see all listings."
                : "There are no listings yet. Share a useful good or service with the community."}
            </p>
            {products.length ? (
              <button onClick={() => setQuery("")} type="button">Clear search</button>
            ) : (
              <Link className="button" href="/marketplace/upload">Post a listing</Link>
            )}
          </div>
        ) : (
          <div className="marketplace-grid">
            {filteredProducts.map((product) => {
              const images = Array.isArray(product.images) ? product.images : [];
              const image = images[0];
              return (
                <article className="marketplace-card" key={product.id}>
                  <div className="marketplace-image-frame">
                    {image ? (
                      <Image
                        alt={product.title}
                        className="marketplace-product-image"
                        fill
                        sizes="(max-width: 600px) 48vw, (max-width: 900px) 45vw, 30vw"
                        src={image}
                      />
                    ) : (
                      <span className="marketplace-image-placeholder">Image not provided</span>
                    )}
                    {product.is_admin && <span className="marketplace-badge">Official listing</span>}
                  </div>
                  <div className="marketplace-card-content">
                    <h2>{product.title}</h2>
                    <p className="marketplace-description">{product.description}</p>
                    <div className="marketplace-price-row">
                      <strong className="marketplace-price">{formatPrice(product.price)}</strong>
                      <span className="marketplace-seller">Seller: {product.seller_contact}</span>
                    </div>
                    <button
                      className="marketplace-card-action"
                      onClick={() => {
                        setBuyerContact("");
                        setContactUrl(null);
                        setContactError("");
                        setSelectedProduct(product);
                      }}
                      type="button"
                    >
                      Buy / contact seller
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedProduct && (
        <dialog
          aria-labelledby="marketplace-dialog-title"
          className="marketplace-modal"
          onCancel={closeInquiry}
          onClose={closeInquiry}
          ref={dialogRef}
        >
            <h2 id="marketplace-dialog-title">Interested in “{selectedProduct.title}”?</h2>
            <p><strong className="marketplace-price">{formatPrice(selectedProduct.price)}</strong></p>
            <p>Seller contact: <strong>{selectedProduct.seller_contact}</strong></p>
            {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && (
              <div className="marketplace-previews">
                {selectedProduct.images.map((image, index) => (
                  <Image
                    alt={`${selectedProduct.title}, photo ${index + 1}`}
                    height={96}
                    key={`${image}-${index}`}
                    sizes="96px"
                    src={image}
                    width={96}
                  />
                ))}
              </div>
            )}
            <form onSubmit={handleContactSeller}>
              <div className="field">
                <label htmlFor="buyer-contact">Your phone number or email</label>
                <input
                  autoComplete="off"
                  id="buyer-contact"
                  maxLength={254}
                  onChange={(event) => {
                    setBuyerContact(event.target.value);
                    setContactUrl(null);
                    setContactError("");
                  }}
                  placeholder="e.g. +234 800 000 0000"
                  required
                  type="text"
                  value={buyerContact}
                />
              </div>
              {contactError && <p className="status error" role="alert">{contactError}</p>}
              {contactUrl && (
                <p className="status" role="status">
                  Your inquiry is ready. Review and send it in your messaging app.
                  {" "}<a href={contactUrl} rel="noopener noreferrer" target="_blank">Open message →</a>
                </p>
              )}
              <div className="marketplace-modal-actions">
                <button disabled={!buyerContact.trim()} type="submit">Prepare message</button>
                <button className="button secondary" onClick={closeInquiry} type="button">Close</button>
              </div>
            </form>
        </dialog>
      )}
    </main>
  );
}
