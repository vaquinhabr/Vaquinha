import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("Missing server environment variable: " + name);
  return value;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const campaignId = typeof body.campaign_id === "string" ? body.campaign_id : "";
    const amountCents = Number(body.amount_cents);
    const payerName = typeof body.payer_name === "string" ? body.payer_name.trim() : "";
    const payerEmail = typeof body.payer_email === "string" ? body.payer_email.trim().toLowerCase() : "";
    const payerCpf = typeof body.payer_cpf === "string" ? body.payer_cpf.replace(/\D/g, "") : "";
    const payerPhone = typeof body.payer_phone === "string" ? body.payer_phone.trim() : "";
    const anonymous = body.is_anonymous === true;

    if (!campaignId || !Number.isSafeInteger(amountCents) || amountCents < 100 || amountCents > 100000000) {
      return json({ error: "Informe uma campanha e um valor entre R$ 1,00 e R$ 1.000.000,00." }, 400);
    }
    if (payerName.length < 2 || payerName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail) || !(/^(\d{11}|\d{14})$/).test(payerCpf)) {
      return json({ error: "Confira o nome, e-mail e CPF/CNPJ do doador." }, 400);
    }

    const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: campaign, error: campaignError } = await supabase.from("campaigns").select("id,title,status").eq("id", campaignId).maybeSingle();
    if (campaignError) throw campaignError;
    if (!campaign || campaign.status !== "active") return json({ error: "Esta campanha não está disponível para receber doações." }, 404);

    const donationId = crypto.randomUUID();
    const idempotencyKey = "vaquinha-" + donationId;
    const description = ("Doação para: " + String(campaign.title)).slice(0, 500);
    const { error: insertError } = await supabase.from("donations").insert({
      id: donationId, campaign_id: campaignId, donor_user_id: null,
      donor_display_name: anonymous ? "Doador anônimo" : payerName,
      amount_cents: amountCents, currency: "BRL", status: "pending", provider: "eleva",
      provider_payment_id: null, idempotency_key: idempotencyKey, paid_at: null,
      metadata: { is_anonymous: anonymous },
    });
    if (insertError) throw insertError;

    const gatewayResponse = await fetch("https://elevapayments.live/api/v1/payments/pix", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env("ELEVA_API_TOKEN"),
        "X-Client-ID": env("ELEVA_CLIENT_ID"),
        Accept: "application/json", "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        amount: Number((amountCents / 100).toFixed(2)), payer_name: payerName,
        payer_email: payerEmail, payer_cpf: payerCpf,
        ...(payerPhone ? { payer_phone: payerPhone } : {}),
        description, reference: donationId,
        ...(process.env.ELEVA_WEBHOOK_URL ? { webhook_url: process.env.ELEVA_WEBHOOK_URL } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
    const responseData = await gatewayResponse.json().catch(() => ({})) as Record<string, unknown>;
    if (!gatewayResponse.ok) {
      await supabase.from("donations").update({ status: "failed", metadata: { gateway_error_code: "provider_rejected" } }).eq("id", donationId);
      return json({ error: "O gateway não conseguiu criar a cobrança Pix. Tente novamente." }, 502);
    }

    const nested = (responseData.data && typeof responseData.data === "object" ? responseData.data : responseData) as Record<string, unknown>;
    const providerId = String(nested.transaction_uuid ?? nested.payment_id ?? nested.id ?? nested.uuid ?? "");
    const { error: updateError } = await supabase.from("donations").update({
      provider_payment_id: providerId || null,
      metadata: {
        payer_email: payerEmail, payer_cpf_last4: payerCpf.slice(-4),
        payer_phone: payerPhone || null, is_anonymous: anonymous, gateway_response: responseData,
      },
    }).eq("id", donationId);
    if (updateError) throw updateError;
    return json({ donation_id: donationId, status: "pending", payment: responseData });
  } catch (error) {
    console.error("Eleva Pix creation failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Não foi possível iniciar a doação. Verifique a configuração do servidor e tente novamente." }, 500);
  }
}
