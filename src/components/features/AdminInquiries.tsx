type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
};

type ChatLog = {
  id: string;
  question: string;
  answer: string | null;
  session_id: string;
  created_at: string;
};

export function AdminInquiries({ leads, chats }: { leads: Lead[]; chats: ChatLog[] }) {
  return (
    <div className="admin-shell">
      <section>
        <h2>Contact inquiries ({leads.length})</h2>
        {leads.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Message</th></tr></thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{new Date(lead.created_at).toLocaleDateString("en-CA")}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email || lead.phone || "—"}</td>
                    <td>{lead.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="status">No contact inquiries yet.</p>}
      </section>
      <section className="section">
        <h2>Chat conversations ({chats.length})</h2>
        {chats.length ? (
          <div style={{ display: "grid", gap: 12 }}>
            {chats.map((chat) => (
              <details className="card" key={chat.id}>
                <summary><strong>{chat.question}</strong><br /><small>{new Date(chat.created_at).toLocaleString("en-CA")}</small></summary>
                <p>{chat.answer || "No assistant response was saved."}</p>
              </details>
            ))}
          </div>
        ) : <p className="status">No chatbot conversations yet.</p>}
      </section>
    </div>
  );
}
