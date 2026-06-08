export type Role = "buyer" | "creator" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  role: Role;
  is_creator: boolean;
  payout_method: string;
  payout_details: string;
  referral_name: string;
  links: string;
  created_at: string;
}

export type ProductType =
  | "template"
  | "prompt_pack"
  | "course"
  | "ebook"
  | "presets"
  | "graphics"
  | "fonts"
  | "printables"
  | "account"
  | "proxy"
  | "other";

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  type: ProductType;
  short_desc: string;
  description: string;
  price: number;
  is_recurring: boolean;
  tags: string[];
  category: string;
  cover_url: string;
  gallery: string[];
  preview_text: string;
  whats_included: string;
  status: "draft" | "pending" | "published" | "rejected";
  featured: boolean;
  views: number;
  rating: number;
  rating_count: number;
  created_at: string;
  creator?: Profile;
}

export type OrderStatus = "pending" | "approved" | "rejected";

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  creator_id: string;
  amount: number;
  status: OrderStatus;
  proof_url: string;
  payment_reference: string;
  payment_method: string;
  admin_note: string;
  payout_status: "unpaid" | "processed";
  created_at: string;
  product?: Product;
  buyer?: Profile;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  buyer?: Profile;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  details: string;
  active: boolean;
}

export interface ApiKeyConfig {
  id: string;
  provider: string;
  key_value: string;
  model: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
