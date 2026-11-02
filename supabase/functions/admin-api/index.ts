import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const allowedOrigins = new Set([
  "https://vaquinha-zeta.vercel.app",
  "http://localhost:3000",
]);

function response(data: unknown, status = 200, origin: string | null = null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (origin && allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(data), { status, headers });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return response({ ok: true }, 200, origin);
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405, origin);

  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return response({ error: "Sessão necessária." }, 401, origin);
  const token = authorization.slice("Bearer ".length);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userResult, error: authError } = await admin.auth.getUser(token);
  const user = userResult.user;
  if (authError || !user || !user.email) return response({ error: "Sessão inválida. Entre novamente." }, 401, origin);

  const { data: adminRow, error: adminError } = await admin
    .from("admin_users")
    .select("user_id,email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRow || adminRow.email.toLowerCase() !== user.email.toLowerCase()) {
    return response({ error: "Acesso restrito ao administrador autorizado." }, 403, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return response({ error: "Solicitação inválida." }, 400, origin);
  }

  const action = body.action;
  try {
    if (action === "listUsers") {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const users = (data.users ?? []).map((u) => ({
        id: u.id,
        email: u.email ?? "",
        name: String(u.user_metadata?.full_name ?? u.user_metadata?.display_name ?? ""),
        created_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
        banned_until: u.banned_until ?? null,
      }));
      return response({ users }, 200, origin);
    }

    if (action === "listCampaigns") {
      const { data: campaigns, error } = await admin
        .from("campaigns")
        .select("id,title,description,owner_id,status,goal_cents,initial_raised_cents,created_at,image_url")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const ownerIds = [...new Set((campaigns ?? []).map((c) => c.owner_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = ownerIds.length
        ? await admin.from("profiles").select("id,display_name").in("id", ownerIds)
        : { data: [], error: null };
      if (profilesError) throw profilesError;
      const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? ""]));
      const campaignIds = (campaigns ?? []).map((c) => c.id);
      const { data: donations, error: donationsError } = campaignIds.length
        ? await admin.from("donations").select("campaign_id,amount_cents").in("campaign_id", campaignIds).eq("status", "paid")
        : { data: [], error: null };
      if (donationsError) throw donationsError;
      const raised = new Map<string, number>();
      for (const donation of donations ?? []) {
        raised.set(donation.campaign_id, (raised.get(donation.campaign_id) ?? 0) + Number(donation.amount_cents ?? 0));
      }
      return response({
        campaigns: (campaigns ?? []).map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          user_id: c.owner_id,
          owner_name: names.get(c.owner_id) ?? "",
          status: c.status,
          goal_amount: Number(c.goal_cents ?? 0) / 100,
          current_amount: (Number(c.initial_raised_cents ?? 0) + (raised.get(c.id) ?? 0)) / 100,
          created_at: c.created_at,
          image_url: c.image_url ?? null,
        })),
      }, 200, origin);
    }

    if (action === "listPayments") {
      const { data: payments, error } = await admin
        .from("donations")
        .select("id,campaign_id,donor_display_name,amount_cents,currency,status,provider,provider_payment_id,paid_at,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const campaignIds = [...new Set((payments ?? []).map((p) => p.campaign_id).filter(Boolean))];
      const { data: campaignRows, error: campaignError } = campaignIds.length
        ? await admin.from("campaigns").select("id,title").in("id", campaignIds)
        : { data: [], error: null };
      if (campaignError) throw campaignError;
      const titles = new Map((campaignRows ?? []).map((c) => [c.id, c.title]));
      return response({
        payments: (payments ?? []).map((p) => ({ ...p, campaign_title: titles.get(p.campaign_id) ?? "Campanha removida" })),
      }, 200, origin);
    }

    if (action === "updateCampaign") {
      const id = String(body.id ?? "");
      const fields: Record<string, unknown> = {};
      if (typeof body.status === "string") {
        if (!["draft", "pending_review", "active", "paused", "completed", "rejected"].includes(body.status)) {
          return response({ error: "Status inválido." }, 400, origin);
        }
        fields.status = body.status;
      }
      if (typeof body.title === "string") {
        const title = body.title.trim();
        if (title.length < 5 || title.length > 120) return response({ error: "O título deve ter entre 5 e 120 caracteres." }, 400, origin);
        fields.title = title;
      }
      if (typeof body.description === "string") {
        const description = body.description.trim();
        if (description.length < 20 || description.length > 10000) return response({ error: "A descrição deve ter entre 20 e 10.000 caracteres." }, 400, origin);
        fields.description = description;
      }
      if (body.goal_amount !== undefined) {
        const goal = Number(body.goal_amount);
        if (!Number.isFinite(goal) || goal < 1 || goal > 100000000) return response({ error: "A meta deve ser maior que zero." }, 400, origin);
        fields.goal_cents = Math.round(goal * 100);
      }
      if (body.image_url === null || typeof body.image_url === "string") {
        const imageUrl = typeof body.image_url === "string" ? body.image_url.trim() : "";
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return response({ error: "URL da imagem inválida." }, 400, origin);
        fields.image_url = imageUrl || null;
      }
      if (!id || Object.keys(fields).length === 0) return response({ error: "Informe a campanha e os campos válidos." }, 400, origin);
      const { data, error } = await admin.from("campaigns").update(fields).eq("id", id).select("id,title,status,description,goal_cents,image_url").single();
      if (error) throw error;
      return response({ campaign: data }, 200, origin);
    }

    if (action === "deleteCampaign") {
      const id = String(body.id ?? "");
      if (!id) return response({ error: "Campanha não informada." }, 400, origin);
      const { error } = await admin.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      return response({ ok: true }, 200, origin);
    }

    if (action === "banUser" || action === "unbanUser") {
      const id = String(body.id ?? "");
      if (!id || id === user.id) return response({ error: "Não é permitido bloquear a própria conta." }, 400, origin);
      const { data, error } = await admin.auth.admin.updateUserById(id, {
        ban_duration: action === "banUser" ? "876000h" : "none",
      });
      if (error) throw error;
      return response({ user: { id: data.user.id, banned_until: data.user.banned_until ?? null } }, 200, origin);
    }

    if (action === "deleteUser") {
      const id = String(body.id ?? "");
      if (!id || id === user.id) return response({ error: "Não é permitido excluir a própria conta administradora." }, 400, origin);
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
      return response({ ok: true }, 200, origin);
    }

    return response({ error: "Ação desconhecida." }, 400, origin);
  } catch (error) {
    console.error("admin-api failure", error instanceof Error ? error.message : "unknown error");
    return response({ error: "Não foi possível concluir a ação administrativa." }, 500, origin);
  }
});
