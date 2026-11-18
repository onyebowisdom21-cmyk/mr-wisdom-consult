"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteContentAction, saveContent } from "@/lib/actions/content";
import type { ActionResult, ContentKind } from "@/types/platform";

type AdminValue = string | number | boolean | string[] | null;
export type AdminRow = { id: string; title: string; slug: string; [key: string]: AdminValue };

type Field = {
  key: string;
  label: string;
  type?: "text" | "email" | "url" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  help?: string;
};

const fields: Record<ContentKind, Field[]> = {
  services: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "category", label: "Category", required: true }, { key: "shortDescription", label: "Short description", type: "textarea", required: true },
    { key: "fullDetails", label: "Full details", type: "textarea" },
    { key: "pricingModel", label: "Pricing model", type: "select", options: ["Fixed", "Custom Quote", "Hourly"], required: true },
    { key: "price", label: "Price", type: "number" }, { key: "currency", label: "Currency", required: true },
    { key: "deliverables", label: "Deliverables (one per line)", type: "textarea" },
    { key: "ctaUrl", label: "Booking URL", type: "url" }, { key: "isActive", label: "Published", type: "select", options: ["true", "false"] },
  ],
  products: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "productType", label: "Product type", required: true }, { key: "summary", label: "Summary", type: "textarea", required: true },
    { key: "description", label: "Description", type: "textarea" }, { key: "price", label: "Price", type: "number", required: true },
    { key: "currency", label: "Currency", required: true }, { key: "coverImage", label: "Cover image URL", type: "url" },
    { key: "purchaseOrAccessUrl", label: "Purchase/access URL", type: "url" },
    { key: "features", label: "Features (one per line)", type: "textarea" },
    { key: "isAvailable", label: "Available to the public", type: "select", options: ["true", "false"] },
  ],
  articles: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "category", label: "Category", type: "select", options: ["News", "Announcement"], required: true },
    { key: "summary", label: "Summary", type: "textarea", required: true }, { key: "featuredImage", label: "Featured image URL", type: "url" },
    { key: "content", label: "Article content", type: "textarea" }, { key: "author", label: "Author", required: true },
    { key: "tags", label: "Tags (one per line)", type: "textarea" }, { key: "publishedDate", label: "Published date", type: "datetime-local", required: true },
    { key: "externalReferenceUrl", label: "Source URL", type: "url" },
    { key: "isPublished", label: "Published", type: "select", options: ["false", "true"] },
  ],
  scholarships: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "institution", label: "Institution", required: true }, { key: "country", label: "Country", required: true },
    { key: "fundingType", label: "Funding type", type: "select", options: ["Full", "Partial"], required: true },
    { key: "value", label: "Funding value" }, { key: "deadline", label: "Deadline", type: "date" },
    { key: "eligibilitySummary", label: "Eligibility summary", type: "textarea", required: true },
    { key: "requirements", label: "Requirements", type: "textarea" }, { key: "applicationUrl", label: "Application URL", type: "url", required: true },
    { key: "isFeatured", label: "Featured", type: "select", options: ["true", "false"] },
    { key: "isPublished", label: "Published", type: "select", options: ["true", "false"] },
  ],
  grants: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "fundingOrganization", label: "Funding organization", required: true }, { key: "focalArea", label: "Focal area", required: true },
    { key: "grantAmount", label: "Grant amount" }, { key: "applicationDeadline", label: "Deadline", type: "date" },
    { key: "eligibility", label: "Eligibility", type: "textarea" }, { key: "applicationUrl", label: "Application URL", type: "url", required: true },
    { key: "isPublished", label: "Published", type: "select", options: ["true", "false"] },
  ],
  jobs: [
    { key: "title", label: "Role title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "organization", label: "Organization", required: true }, { key: "location", label: "Location", required: true },
    { key: "workMode", label: "Work mode", type: "select", options: ["Remote", "Hybrid", "On-site"], required: true },
    { key: "jobType", label: "Job type", type: "select", options: ["Full-time", "Contract", "Internship"], required: true },
    { key: "salaryRange", label: "Salary range" }, { key: "description", label: "Description", type: "textarea" },
    { key: "deadline", label: "Deadline", type: "date" }, { key: "applicationUrl", label: "Application URL", type: "url", required: true },
    { key: "isPublished", label: "Published", type: "select", options: ["true", "false"] },
  ],
  empowerment: [
    { key: "title", label: "Program title", required: true }, { key: "slug", label: "Slug", required: true },
    { key: "organizer", label: "Organizer", required: true }, { key: "programType", label: "Program type", required: true },
    { key: "targetAudience", label: "Target audience", required: true }, { key: "benefits", label: "Benefits", type: "textarea" },
    { key: "deadline", label: "Deadline", type: "date" }, { key: "registrationUrl", label: "Registration URL", type: "url", required: true },
    { key: "isPublished", label: "Published", type: "select", options: ["true", "false"] },
  ],
};

const initialSave: ActionResult<{ id: string }> = { ok: false, error: "" };
const initialDelete: ActionResult = { ok: false, error: "" };

function fieldValue(value: AdminValue | undefined, field: Field): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("\n");
  if (field.type === "datetime-local" && typeof value === "string") return value.slice(0, 16);
  return String(value);
}

function DeleteButton({ kind, row }: { kind: ContentKind; row: AdminRow }) {
  const router = useRouter();
  const action = deleteContentAction.bind(null, kind, row.id);
  const [state, formAction, pending] = useActionState(action, initialDelete);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [router, state.ok]);

  return (
    <div>
      <form action={formAction}>
        <button className="button secondary" disabled={pending} type="submit" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>
          {pending ? "Deleting…" : "Delete"}
        </button>
      </form>
      {!state.ok && state.error && <p className="status error" role="alert">{state.error}</p>}
    </div>
  );
}

export function AdminEditor({ kind, items }: { kind: ContentKind; items: AdminRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const action = saveContent.bind(null, kind, editing?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialSave);

  useEffect(() => {
    if (state.ok) {
      setEditing(null);
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <div className="content-layout">
      <section>
        <div className="section-head">
          <div>
            <h2>{items.length} {items.length === 1 ? "item" : "items"}</h2>
            <p className="section-intro">Create, edit or remove catalog entries.</p>
          </div>
          <button type="button" onClick={() => setEditing(null)}>{kind === "articles" ? "New draft" : "New item"}</button>
        </div>
        {kind === "articles" && (
          <p className="status">
            To share a WhatsApp Channel update, copy its text into a news item, add its post link as the source, then review the details. New items start as drafts and stay off the public site until you set Published to true.
            {" "}<a href="https://whatsapp.com/channel/0029Va9ZoIj7dmeSGEgQRR0f" rel="noopener noreferrer" target="_blank">Open the WhatsApp channel ↗</a>
          </p>
        )}
        {items.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Slug</th>{kind === "articles" && <th>Status</th>}<th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.slug}</td>
                    {kind === "articles" && <td>{row.isPublished === true ? "Published" : "Draft"}</td>}
                    <td>{typeof row.updated_at === "string" ? row.updated_at.slice(0, 10) : "—"}</td>
                    <td>
                      <div className="admin-nav">
                        <button className="button light" onClick={() => setEditing(row)} type="button">Edit</button>
                        <DeleteButton kind={kind} row={row} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="status">No entries yet. Use the form to add the first one.</p>}
      </section>

      <section>
        <h2>{editing ? `Edit ${editing.title}` : "Create an item"}</h2>
        {!state.ok && state.error && <p className="status error" role="alert">{state.error}</p>}
        {state.ok && <p className="status" role="status">Saved successfully.</p>}
        <form action={formAction} className="admin-form" key={editing?.id ?? "new"}>
          <div className="admin-form-grid">
            {fields[kind].map((field) => {
              const value = fieldValue(editing?.[field.key], field);
              return (
                <div className="field" key={field.key}>
                  <label htmlFor={`field-${field.key}`}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea defaultValue={value} id={`field-${field.key}`} name={field.key} required={field.required} />
                  ) : field.type === "select" ? (
                    <select defaultValue={value || field.options?.[0]} id={`field-${field.key}`} name={field.key} required={field.required}>
                      {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input
                      defaultValue={value}
                      id={`field-${field.key}`}
                      maxLength={field.type === "url" ? 2048 : undefined}
                      name={field.key}
                      required={field.required}
                      step={field.type === "number" ? "any" : undefined}
                      type={field.type ?? "text"}
                    />
                  )}
                  {field.help && <small>{field.help}</small>}
                </div>
              );
            })}
          </div>
          <div className="admin-nav">
            <button disabled={pending} type="submit">{pending ? "Saving…" : editing ? "Save changes" : "Create item"}</button>
            {editing && <button className="button light" onClick={() => setEditing(null)} type="button">Cancel edit</button>}
          </div>
        </form>
      </section>
    </div>
  );
}
