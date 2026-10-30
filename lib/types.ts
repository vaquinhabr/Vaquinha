export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed"
  | "rejected";

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  goal_cents: number;
  image_url: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  campaign_id: string;
  donor_user_id: string | null;
  donor_display_name: string | null;
  amount_cents: number;
  currency: "BRL";
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  provider: string | null;
  provider_payment_id: string | null;
  idempotency_key: string;
  paid_at: string | null;
  created_at: string;
};

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  pending_review: "Em análise",
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
  rejected: "Recusada",
};

export const categoryLabel: Record<string, string> = {
  saude: "Saúde",
  educacao: "Educação",
  emergencia: "Emergência",
  animais: "Animais",
  projetos: "Projetos sociais",
  outros: "Outros",
};
