import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEditor, type AdminRow } from "@/components/features/AdminEditor";
import { AdminInquiries } from "@/components/features/AdminInquiries";
import { signOut } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { createAuthClient } from "@/lib/supabase/server";
import { CONTENT_KINDS, type ContentKind } from "@/types/platform";

const titleFor: Record<ContentKind, string> = {
  services: "Services",
  products: "Products",
  articles: "News & announcements",
  scholarships: "Scholarships",
  grants: "Grants",
  jobs: "Jobs",
  empowerment: "Empowerment programs",
};

async function AdminDashboard() {
  const supabase = await createAuthClient();
  const tables = [...CONTENT_KINDS, "leads", "chat_logs"] as const;
  const counts = await Promise.all(tables.map(async (table) => {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw new Error(`Unable to load ${table} metrics: ${error.message}`);
    return [table, count ?? 0] as const;
  }));
  const values = new Map(counts);
  return (
    <section>
      <div className="section-head">
        <div><h2>Overview</h2><p className="section-intro">Manage the live catalog and review incoming conversations.</p></div>
        <form action={signOut}><button className="button light" type="submit">Sign out</button></form>
      </div>
      <div className="card-grid">
        {tables.map((table) => (
          <article className="card" key={table}>
            <div className="card-meta">{titleFor[table as ContentKind] ?? table.replace("_", " ")}</div>
            <h3>{values.get(table) ?? 0}</h3>
            {CONTENT_KINDS.includes(table as ContentKind) && (
              <Link className="text-link" href={`/admin/${table}`}>Manage →</Link>
            )}
                {(table === "leads" || table === "chat_logs") && <Link className="text-link" href="/admin/inquiries">Review →</Link>}
          </article>
        ))}
      </div>
      <nav className="admin-nav" aria-label="Admin content">
        {CONTENT_KINDS.map((kind) => <Link className="button light" href={`/admin/${kind}`} key={kind}>{titleFor[kind]}</Link>)}
      </nav>
    </section>
  );
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ section = [] }, query] = await Promise.all([params, searchParams]);
  if (section[0] === "login") {
    const { AdminLogin } = await import("@/components/features/AdminLogin");
    return <AdminLogin unauthorized={query.error === "unauthorized"} />;
  }
  await requireAdmin();

  let content: React.ReactNode;
  if (section.length === 0 || section[0] === "dashboard") {
    content = await AdminDashboard();
  } else if (CONTENT_KINDS.includes(section[0] as ContentKind) && section.length === 1) {
    const kind = section[0] as ContentKind;
    const supabase = await createAuthClient();
    const { data, error } = await supabase.from(kind).select("*").order("updated_at", { ascending: false });
    if (error) throw new Error(`Unable to load ${kind} for administration: ${error.message}`);
    content = <AdminEditor items={(data ?? []) as AdminRow[]} kind={kind} />;
  } else if (section[0] === "inquiries" && section.length === 1) {
    const supabase = await createAuthClient();
    const [leadResult, chatResult] = await Promise.all([
      supabase.from("leads").select("id,name,email,phone,message,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("chat_logs").select("id,question,answer,session_id,created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    if (leadResult.error) throw new Error(`Unable to load contact inquiries: ${leadResult.error.message}`);
    if (chatResult.error) throw new Error(`Unable to load chatbot conversations: ${chatResult.error.message}`);
    content = <AdminInquiries chats={chatResult.data ?? []} leads={leadResult.data ?? []} />;
  } else {
    notFound();
  }

  return (
    <main className="admin-shell">
      <div className="container">
        <div className="eyebrow">Owner control panel</div>
        <h1 className="page-title">Admin dashboard</h1>
        <nav className="admin-nav" aria-label="Admin navigation">
          <Link className="button light" href="/admin/dashboard">Overview</Link>
          <Link className="button light" href="/admin/inquiries">Inquiries</Link>
          {CONTENT_KINDS.map((kind) => <Link className="button light" href={`/admin/${kind}`} key={kind}>{titleFor[kind]}</Link>)}
        </nav>
        {content}
      </div>
    </main>
  );
}
