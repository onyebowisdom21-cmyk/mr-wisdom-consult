"use client";

import { useActionState } from "react";
import { submitLead } from "@/lib/actions/leads";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitLead, { ok: false, error: "" });

  if (state.ok) {
    return <p className="status" role="status">Thanks for reaching out. Your inquiry has been received.</p>;
  }

  return (
    <form action={action} className="admin-form">
      {state.error && <p className="status error" role="alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="lead-name">Your name</label>
        <input id="lead-name" name="name" required minLength={2} maxLength={100} autoComplete="name" />
      </div>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="lead-email">Email</label>
          <input id="lead-email" name="email" type="email" maxLength={254} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="lead-phone">Phone</label>
          <input id="lead-phone" name="phone" type="tel" maxLength={30} autoComplete="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="lead-message">How can we help?</label>
        <textarea id="lead-message" name="message" required minLength={5} maxLength={2000} />
      </div>
      <div className="field" aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
        <label htmlFor="lead-website">Leave this field empty</label>
        <input id="lead-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send inquiry"}</button>
      <p className="section-intro">Provide at least one way for us to contact you.</p>
    </form>
  );
}
