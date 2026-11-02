import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("Missing server environment variable: " + name);
  return value;
}
function safeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a), right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}
async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-webhook-signature-v2") || "";
  const eventId = request.headers.get("x-webhook-id") || "";
  const match = signatureHeader.match(/(?:^|[,;\s])t=(\d+)[,;\s]+v1=([a-f0-9]+)/i);
  if (!match) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const timestamp = Number(match[1]);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp * 1000) > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Expired timestamp" }, { status: 401 });
  }
  let expected: string;
  try { expected = await hmacHex(env("ELEVA_API_TOKEN"), timestamp + "." + rawBody); }
  catch { return NextResponse.json({ error: "Webhook not configured" }, { status: 500 }); }
  if (!safeEqual(expected, match[2].toLowerCase())) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody) as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const eventName = String(payload.event || request.headers.get("x-webhook-event") || "");
  const data = (payload.data && typeof payload.data === "object" ? payload.data : payload) as Record<string, unknown>;
  const reference = String(data.reference || data.external_reference || "");
  const providerId = String(data.transaction_uuid || data.payment_id || data.id || "");
  if (!reference && !providerId) return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });

  try {
    const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const uniqueEventId = eventId || String(payload.id || (eventName + ":" + (providerId || reference) + ":" + timestamp));
    const { data: existingEvent, error: existingEventError } = await supabase.from("payment_webhook_events").select("id").eq("id", uniqueEventId).maybeSingle();
    if (existingEventError) throw existingEventError;
    if (existingEvent) return NextResponse.json({ ok: true, duplicate: true });

    let donation: { id: string; status: string } | null = null;
    if (reference) {
      const { data, error } = await supabase.from("donations").select("id,status").eq("id", reference).maybeSingle();
      if (error) throw error;
      donation = data;
    }
    if (!donation && providerId) {
      const { data, error } = await supabase.from("donations").select("id,status").eq("provider_payment_id", providerId).maybeSingle();
      if (error) throw error;
      donation = data;
    }
    if (!donation) return NextResponse.json({ ok: true, ignored: true });

    let status: "pending" | "paid" | "failed" | "refunded" | null = null;
    if (eventName === "deposit.completed") status = "paid";
    else if (eventName === "transaction.waiting_payment") status = "pending";
    else if (eventName === "transaction.failed") status = "failed";
    else if (eventName === "transaction.refunded" || eventName === "transaction.chargeback") status = "refunded";
    if (!status) return NextResponse.json({ ok: true, ignored: true });
    const update: Record<string, unknown> = { status };
    if (status === "paid") update.paid_at = new Date().toISOString();
    const { error: updateError } = await supabase.from("donations").update(update).eq("id", donation.id);
    if (updateError) throw updateError;
    const { error: eventInsertError } = await supabase.from("payment_webhook_events").insert({
      id: uniqueEventId, event_type: eventName, payload: { reference, provider_id: providerId || null, status: data.status ?? null },
    });
    if (eventInsertError && eventInsertError.code !== "23505") throw eventInsertError;
    return NextResponse.json({ ok: true, duplicate: eventInsertError?.code === "23505" });
  } catch (error) {
    console.error("Eleva webhook processing failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
