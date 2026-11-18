"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

export interface CatalogCard {
  title: string;
  summary: string;
  href: string;
  category: string;
  detail?: string;
  image?: string;
}

export function CatalogGrid({ items }: { items: CatalogCard[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.title} ${item.summary} ${item.category} ${item.detail ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  return (
    <>
      <div className="filter-row">
        <label className="sr-only" htmlFor="catalog-search">Search this catalog</label>
        <input
          className="search-input"
          id="catalog-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by keyword…"
          type="search"
          value={query}
        />
        <span aria-live="polite">{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>
      </div>
      {filtered.length ? (
        <div className="card-grid">
          {filtered.map((item) => (
            <article className="card" key={item.href}>
              {item.image && <Image alt="" className="catalog-image" height={360} src={item.image} width={600} />}
              <div className="card-meta">{item.category}</div>
              <h2><Link href={item.href}>{item.title}</Link></h2>
              <p>{item.summary}</p>
              {item.detail && <p><strong>{item.detail}</strong></p>}
              <Link className="text-link" href={item.href}>View details →</Link>
            </article>
          ))}
        </div>
      ) : <p className="status">No matching items. Try another search.</p>}
    </>
  );
}
