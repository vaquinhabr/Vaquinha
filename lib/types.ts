export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  image_url: string | null;
  category: string | null;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  campaign_id: string;
  donor_id: string | null;
  amount: number;
  message: string | null;
  is_anonymous: boolean;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
};
