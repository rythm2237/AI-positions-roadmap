import { notFound } from "next/navigation";
import { verifyJobEmailActionToken } from "@/lib/job-agent/emailActionToken";

const copy = {
  save: {
    title: "Save this job?",
    body: "This job will be kept in your Saved Jobs section and included in future Job Agent digests while it remains available.",
    button: "Save job",
  },
  unsave: {
    title: "Remove this saved job?",
    body: "The job will be removed from Saved Jobs. It can still appear elsewhere if it remains a relevant active opportunity.",
    button: "Remove saved job",
  },
  not_relevant: {
    title: "Mark this job as not relevant?",
    body: "The Job Agent will stop surfacing this vacancy and use the feedback as a learning signal for future recommendations.",
    button: "Mark as not relevant",
  },
} as const;

export default async function JobActionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = verifyJobEmailActionToken(token);
  if (!payload) notFound();
  const text = copy[payload.action];

  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fb", padding: "48px 18px", fontFamily: "Arial, sans-serif", color: "#111827" }}>
      <section style={{ maxWidth: 560, margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 28, boxShadow: "0 14px 40px rgba(15,23,42,.08)" }}>
        <div style={{ color: "#315efb", fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>AI Role Path · Job Agent</div>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "10px 0" }}>{text.title}</h1>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.65, margin: "0 0 22px" }}>{text.body}</p>
        <form action="/api/job-agent/email-action" method="post">
          <input type="hidden" name="token" value={token} />
          <button type="submit" style={{ border: 0, borderRadius: 12, background: payload.action === "not_relevant" ? "#c2410c" : "#315efb", color: "#fff", padding: "12px 18px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            {text.button}
          </button>
          <a href="/job-agent" style={{ display: "inline-block", marginLeft: 10, color: "#475569", padding: "12px 10px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Cancel</a>
        </form>
        <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.55, marginTop: 22 }}>
          For security, opening an email link never changes your data. The action is applied only after this confirmation.
        </p>
      </section>
    </main>
  );
}
