import { supabase } from "./supabase";

const SAMPLE = [
  {
    title: "Ultimate Notion Productivity OS",
    type: "template",
    short_desc: "An all-in-one Notion dashboard for tasks, goals & habits.",
    description:
      "Run your entire life and business from one beautiful Notion workspace.\n\nIncludes task manager, goal tracker, habit system, CRM, and content calendar — all linked and automated.",
    price: 29,
    tags: ["notion", "productivity", "template", "dashboard"],
    whats_included: "Full Notion OS\nLifetime updates\nSetup video guide\nBonus templates",
    cover_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=900&q=80",
    featured: true,
  },
  {
    title: "AI Prompt Vault — 500+ ChatGPT Prompts",
    type: "prompt_pack",
    short_desc: "500+ tested prompts for marketing, coding, writing & more.",
    description:
      "Stop struggling with prompts. This vault gives you 500+ copy-paste prompts organized by category, each engineered for maximum output quality.",
    price: 19,
    tags: ["ai", "chatgpt", "prompts", "marketing"],
    whats_included: "500+ prompts\nCategory index\nMonthly updates",
    cover_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
    featured: true,
  },
  {
    title: "Cinematic Lightroom Presets Pack",
    type: "presets",
    short_desc: "20 moody cinematic presets for stunning photos instantly.",
    description: "Transform your photos with one tap. 20 professionally crafted presets for portraits, travel and street photography.",
    price: 15,
    tags: ["lightroom", "presets", "photography", "cinematic"],
    whats_included: "20 .xmp presets\nMobile + desktop\nInstall guide",
    cover_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80",
  },
  {
    title: "Freelance Mastery Mini-Course",
    type: "course",
    short_desc: "Land your first $5k freelance client in 30 days.",
    description: "A step-by-step mini-course covering positioning, outreach, pricing and closing high-ticket freelance clients.",
    price: 39,
    tags: ["freelance", "course", "business", "income"],
    whats_included: "8 video lessons\nOutreach templates\nPricing calculator",
    cover_url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900&q=80",
    featured: true,
  },
  {
    title: "Minimalist Icon Pack (300 SVGs)",
    type: "graphics",
    short_desc: "300 clean line icons for web & app design.",
    description: "A versatile set of 300 pixel-perfect SVG icons in a consistent minimalist style. Fully editable and scalable.",
    price: 12,
    tags: ["icons", "svg", "design", "ui"],
    whats_included: "300 SVG icons\nFigma file\nLicense for commercial use",
    cover_url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80",
  },
  {
    title: "2026 Digital Planner (GoodNotes)",
    type: "printables",
    short_desc: "Hyperlinked digital planner for iPad & tablets.",
    description: "Stay organized in 2026 with this beautiful hyperlinked digital planner. Daily, weekly, monthly views plus habit and finance trackers.",
    price: 9,
    tags: ["planner", "goodnotes", "ipad", "printable"],
    whats_included: "Hyperlinked PDF\n12 months\nDark & light versions",
    cover_url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80",
  },
];

export async function seedDemo(creatorId: string) {
  const rows = SAMPLE.map((s) => ({
    ...s,
    creator_id: creatorId,
    slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    status: "published",
    gallery: [],
    preview_text: "Watermarked preview — full version unlocked after purchase.",
    is_recurring: false,
    views: Math.floor(Math.random() * 400) + 50,
  }));
  const { error } = await supabase.from("products").insert(rows);
  return { error: error?.message };
}
