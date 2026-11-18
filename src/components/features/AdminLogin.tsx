"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

export function AdminLogin({ unauthorized }: { unauthorized: boolean }) {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return (
    <main className="admin-shell">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="eyebrow">Owner access</div>
        <h1 className="page-title">Sign in</h1>
        {unauthorized && <p className="status error" role="alert">This account is not authorized to access the owner dashboard.</p>}
        {state.error && <p className="status error" role="alert">{state.error}</p>}
        <form action={action} className="admin-form">
          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input autoComplete="username" id="admin-email" name="email" required type="email" />
          </div>
          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input autoComplete="current-password" id="admin-password" minLength={8} name="password" required type="password" />
          </div>
          <button disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</button>
        </form>
      </div>
    </main>
  );
}
