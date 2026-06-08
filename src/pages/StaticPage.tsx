import { Card } from "../components/ui";

const PAGES: Record<string, { title: string; body: string }> = {
  terms: {
    title: "Terms of Service",
    body: "By using Brixnode you agree to use the platform lawfully. Brixnode is a marketplace connecting buyers and creators of digital goods. Payments are handled manually via external methods and verified by admin approval. Brixnode is not liable for content quality but moderates listings. All sales are subject to our refund and DMCA policies.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "We collect only the data needed to operate the marketplace: account info, order history, payment proof images, and usage analytics. We never sell your data. Payment proof screenshots are stored securely and only viewable by admins for verification. You may request deletion of your account and data at any time (GDPR ready).",
  },
  creators: {
    title: "Creator Agreement",
    body: "As a creator you retain ownership of your content and grant Brixnode a license to display and deliver it to buyers. Brixnode takes a configurable commission (default 20%) on each approved sale. Payouts are processed manually by admin after you add your payout details. You must own the rights to everything you list. Prohibited: malware, illegal accounts, stolen content.",
  },
  dmca: {
    title: "DMCA & Refund Policy",
    body: "Refunds for digital goods are handled manually case-by-case by admin. To report copyright infringement, contact us with proof of ownership and the infringing listing URL; verified claims are removed promptly. Repeat infringers are banned.",
  },
  about: {
    title: "About Brixnode",
    body: "Brixnode is the elevated hub for digital tools, AI assets, templates, knowledge & creation. We give creators a beautiful storefront and buyers rich previews with secure, manual-payment delivery and instant post-approval access. Built for the 2026 creator economy.",
  },
  contact: {
    title: "Contact Us",
    body: "Questions, partnerships, or support? Reach the Brixnode team at support@brixnode.com. We typically respond within 24 hours. Admins also handle payment approvals and payout requests through your dashboard.",
  },
};

export default function StaticPage({ slug }: { slug: string }) {
  const page = PAGES[slug] || { title: "Page", body: "Coming soon." };
  return (
    <div className="mx-auto max-w-2xl animate-fade">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{page.title}</h1>
      <Card className="mt-6 p-6">
        <p className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">{page.body}</p>
      </Card>
    </div>
  );
}
