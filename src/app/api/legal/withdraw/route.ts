import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { legalOperator } from "@/lib/legal";

interface WithdrawalPayload {
  name: string;
  email: string;
  orderReference: string;
  note: string;
  confirm: string;
}

function validate(body: unknown): WithdrawalPayload {
  if (!body || typeof body !== "object") throw new Error("Invalid request body.");
  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const orderReference = typeof data.orderReference === "string" ? data.orderReference.trim() : "";
  const note = typeof data.note === "string" ? data.note.trim().slice(0, 2000) : "";
  const confirm = typeof data.confirm === "string" ? data.confirm : "";
  if (name.length < 2) throw new Error("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");
  if (!orderReference) throw new Error("Please enter the order or subscription reference.");
  if (confirm !== "yes") throw new Error("You must confirm the withdrawal statement.");
  return { name, email, orderReference, note, confirm };
}

async function sendEmail(args: { to: string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Withdrawal confirmation email is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, ...args }),
  });
  if (!response.ok) throw new Error("Withdrawal confirmation email failed.");
}

export async function POST(req: NextRequest) {
  try {
    const payload = validate(await req.json().catch(() => null));
    const operatorEmail = legalOperator.contactEmail || legalOperator.supportEmail;
    if (!operatorEmail) {
      return NextResponse.json({ error: "Legal contact is not configured. Paid sales must remain disabled until it is configured." }, { status: 503 });
    }

    const reference = `WDR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const submittedAt = new Date().toISOString();
    const safe = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);

    await sendEmail({
      to: [operatorEmail],
      subject: `Consumer withdrawal request ${reference}`,
      html: `<h1>Consumer withdrawal request</h1><p><strong>Reference:</strong> ${reference}</p><p><strong>Submitted:</strong> ${submittedAt}</p><p><strong>Name:</strong> ${safe(payload.name)}</p><p><strong>Email:</strong> ${safe(payload.email)}</p><p><strong>Order/subscription:</strong> ${safe(payload.orderReference)}</p><p><strong>Statement:</strong> I want to withdraw from the identified contract.</p><p><strong>Note:</strong> ${safe(payload.note || "—")}</p>`,
    });

    await sendEmail({
      to: [payload.email],
      subject: `We received your withdrawal request — ${reference}`,
      html: `<h1>Withdrawal request received</h1><p>Hello ${safe(payload.name)},</p><p>We confirm receipt of your statement that you want to withdraw from the contract identified as <strong>${safe(payload.orderReference)}</strong>.</p><p><strong>Reference:</strong> ${reference}<br/><strong>Received:</strong> ${submittedAt}</p><p>This confirmation records receipt of your statement. Eligibility, refund amount and any effect of prior performance will be assessed under the applicable consumer rules and contract terms.</p>`,
    });

    return NextResponse.json({ success: true, reference }, { status: 200 });
  } catch (error) {
    console.error("[Legal withdrawal]", error);
    const message = error instanceof Error ? error.message : "Unable to submit withdrawal request.";
    const isValidation = /Please|Invalid|confirm/.test(message);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
