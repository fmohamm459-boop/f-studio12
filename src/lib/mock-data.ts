// Static mock data for the public pages phase. Shapes intentionally mirror
// the three approved future database entities (Projects, Testimonials,
// Messages — Foundation Plan §5 / Blueprint §5) so this file can be swapped
// for real Prisma queries in the Data Integration stage without changing
// page-level markup. No schema or database code is defined here.

export type ProjectCategory =
  | "Branding"
  | "Web Development"
  | "Data Analysis"
  | "AI";

// Admin-facing publication state for the Projects Management table
// (Component_List §15.4 / Page_Structure §13). Optional so the existing
// public-page usages of Project are unaffected.
export type ProjectStatus = "Published" | "Draft";

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: string;
  role: string;
  status?: ProjectStatus;
  updatedAt?: string;
  liveLink?: string;
  summary: string;
  description: string;
  tags: string[];
  overview: string;
  challenge: string;
  research: string;
  solution: string;
  resultStats: { label: string; value: string; trend?: { direction: "up" | "down"; text: string } }[];
  // Phase 9.3.12 — File & Media Management. Cloudinary secure_url values
  // only; uploading is handled client-side (PdfUploadZone.tsx), this
  // field just carries the resulting URLs through the existing Project
  // Editor save flow. Optional so the pre-existing PROJECTS mock array
  // below doesn't need every entry updated.
  pdfFiles?: string[];
  // Phase 9.3.12 Stage 2 — same reasoning: optional, no mock entry needs
  // updating. `heroImage` is a single URL (or absent); `galleryImages`
  // preserves upload order.
  heroImage?: string;
  galleryImages?: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "meridian-bank-identity",
    title: "Meridian Bank Identity",
    client: "Meridian Bank",
    category: "Branding",
    year: "2025",
    role: "Brand Identity, Logo Design",
    status: "Published",
    updatedAt: "2025-11-02",
    summary: "A full identity system for a digital-first regional bank.",
    description: "Wordmark, mark, and application system built for trust and clarity.",
    tags: ["Identity", "Logo", "Guidelines"],
    overview: "Meridian Bank needed an identity that read as trustworthy and modern.",
    challenge: "The prior mark did not scale to app icon sizes or dark surfaces.",
    research: "We audited regional banking marks and tested legibility at 16px.",
    solution: "A geometric monogram with a full wordmark lockup for wider contexts.",
    resultStats: [
      { label: "Brand recall lift", value: "32%", trend: { direction: "up", text: "post-launch survey" } },
      { label: "Asset variants delivered", value: "24" },
    ],
  },
  {
    slug: "northpoint-dashboard",
    title: "Northpoint Analytics Dashboard",
    client: "Northpoint Logistics",
    category: "Data Analysis",
    year: "2025",
    role: "Data Analysis, Dashboard Design",
    status: "Published",
    updatedAt: "2025-10-18",
    summary: "A fleet performance dashboard replacing three disconnected spreadsheets.",
    description: "Consolidated reporting with clear trend indicators for operations teams.",
    tags: ["Dashboards", "PostgreSQL", "Charts"],
    overview: "Northpoint tracked fleet performance across three separate spreadsheets.",
    challenge: "No single source of truth existed for delay causes or fuel trends.",
    research: "We interviewed dispatchers to find the five metrics they checked daily.",
    solution: "A single dashboard with Stat blocks and accessible chart fallbacks.",
    resultStats: [
      { label: "Reporting time saved", value: "6 hrs/wk", trend: { direction: "down", text: "vs. prior process" } },
      { label: "Data sources merged", value: "3" },
    ],
  },
  {
    slug: "atlas-web-platform",
    title: "Atlas Web Platform",
    client: "Atlas Outfitters",
    category: "Web Development",
    year: "2024",
    role: "Website Development",
    status: "Published",
    updatedAt: "2025-06-30",
    liveLink: "https://example.com",
    summary: "A performance-first storefront rebuild on Next.js.",
    description: "Rebuilt storefront focused on load performance and accessibility.",
    tags: ["Next.js", "TypeScript", "Vercel"],
    overview: "Atlas Outfitters' legacy storefront was slow on mobile networks.",
    challenge: "Largest Contentful Paint exceeded 5 seconds on 4G connections.",
    research: "We profiled the render path and found unoptimized hero media as the cause.",
    solution: "A rebuilt storefront on Next.js with responsive image delivery.",
    resultStats: [
      { label: "Load time", value: "1.8s", trend: { direction: "down", text: "from 5.1s" } },
      { label: "Accessibility score", value: "98" },
    ],
  },
  {
    slug: "clearline-ai-assistant",
    title: "Clearline Support Assistant",
    client: "Clearline Insurance",
    category: "AI",
    year: "2025",
    role: "Artificial Intelligence",
    status: "Draft",
    updatedAt: "2026-07-14",
    summary: "A claims-support assistant that triages inbound questions.",
    description: "An assistant that classifies and routes claims questions with clear rationale.",
    tags: ["AI", "Automation", "TypeScript"],
    overview: "Clearline's support team was manually triaging every inbound message.",
    challenge: "Response routing errors added a day to average resolution time.",
    research: "We reviewed a year of anonymized ticket categories with the support lead.",
    solution: "A triage assistant that routes tickets and explains its reasoning inline.",
    resultStats: [
      { label: "Routing accuracy", value: "94%" },
      { label: "Avg. resolution time", value: "-1 day", trend: { direction: "down", text: "vs. prior quarter" } },
    ],
  },
  {
    slug: "solace-wordmark",
    title: "Solace Wordmark & Monogram",
    client: "Solace Wellness",
    category: "Branding",
    year: "2024",
    role: "Logo Design",
    status: "Published",
    updatedAt: "2025-03-11",
    summary: "A calm, versatile mark for a wellness studio chain.",
    description: "Wordmark and monogram pairing built for signage and app icons alike.",
    tags: ["Logo", "Monogram"],
    overview: "Solace needed a mark that worked equally on signage and a mobile app icon.",
    challenge: "Their previous script logo broke down below 32px.",
    research: "We tested five monogram directions against real signage mockups.",
    solution: "A rounded monogram with a companion wordmark for wider lockups.",
    resultStats: [{ label: "Sizes delivered", value: "12" }],
  },
  {
    slug: "harborlight-portfolio-site",
    title: "Harborlight Portfolio Site",
    client: "Harborlight Studio",
    category: "Web Development",
    year: "2024",
    role: "Website Development, Data Analysis",
    status: "Draft",
    updatedAt: "2026-07-01",
    summary: "A portfolio site with a built-in inquiry analytics view.",
    description: "Marketing site paired with a lightweight inquiry-source dashboard.",
    tags: ["Next.js", "Tailwind CSS", "Analytics"],
    overview: "Harborlight wanted to see which pages drove the most inquiries.",
    challenge: "Their old site had no way to attribute inquiries to specific pages.",
    research: "We mapped their inquiry funnel from landing page to contact form.",
    solution: "A new marketing site with page-level inquiry-source tracking built in.",
    resultStats: [{ label: "Inquiry attribution coverage", value: "100%" }],
  },
];

// Admin-facing moderation state for the Testimonials Management table
// (Component_List §15.4/§15.6). Optional so the existing public-page usages
// of Testimonial are unaffected.
export type TestimonialStatus = "Pending" | "Approved" | "Hidden";

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  projectSlug?: string;
  status?: TestimonialStatus;
  submittedAt?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "F Studio rebuilt our identity and our storefront in the same quarter, and both felt like they came from one coherent system.",
    author: "Dana Whitfield",
    role: "Marketing Director, Atlas Outfitters",
    rating: 5,
    projectSlug: "atlas-web-platform",
    status: "Approved",
    submittedAt: "2025-07-02",
  },
  {
    id: "t2",
    quote: "The dashboard finally gave our dispatch team one place to look instead of three.",
    author: "Marcus Iyer",
    role: "Operations Lead, Northpoint Logistics",
    rating: 4.8,
    projectSlug: "northpoint-dashboard",
    status: "Approved",
    submittedAt: "2025-10-25",
  },
  {
    id: "t3",
    quote: "Our new mark scales from a favicon to a branch sign without losing its character.",
    author: "Priya Anand",
    role: "Brand Manager, Meridian Bank",
    rating: 5,
    projectSlug: "meridian-bank-identity",
    status: "Approved",
    submittedAt: "2025-11-10",
  },
  {
    id: "t4",
    quote: "The assistant explains its routing decisions, which made our support team trust it fast.",
    author: "Tomás Rivera",
    role: "Support Lead, Clearline Insurance",
    rating: 4.7,
    projectSlug: "clearline-ai-assistant",
    status: "Pending",
    submittedAt: "2026-07-16",
  },
  {
    id: "t5",
    quote: "Calm, precise, and delivered exactly the sizes we needed for every surface.",
    author: "El Fassi Amina",
    role: "Founder, Solace Wellness",
    rating: 4.9,
    projectSlug: "solace-wordmark",
    status: "Hidden",
    submittedAt: "2025-03-20",
  },
];

// Admin-facing fields for the Messages Management inbox (Component_List §15
// / Page_Structure §14). The Contact form (public page) only ever writes the
// four base fields below; id/subject/status/receivedAt are populated here as
// static mock inbox data, not by any submission or API route.
export type MessageStatus = "New" | "Read" | "Replied";

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  service: ProjectCategory | "Other";
  message: string;
  status: MessageStatus;
  receivedAt: string;
};

export const MESSAGES: Message[] = [
  {
    id: "m1",
    name: "Elena Cross",
    email: "elena.cross@example.com",
    subject: "Brand refresh for a Series B launch",
    service: "Branding",
    message:
      "We're raising a Series B and want an identity refresh before the announcement. Do you have capacity this quarter?",
    status: "New",
    receivedAt: "2026-07-19",
  },
  {
    id: "m2",
    name: "Jonah Whit",
    email: "jonah.whit@example.com",
    subject: "Dashboard for warehouse throughput",
    service: "Data Analysis",
    message:
      "Looking for a dashboard that consolidates three warehouse systems into one throughput view.",
    status: "New",
    receivedAt: "2026-07-18",
  },
  {
    id: "m3",
    name: "Priya Anand",
    email: "priya.anand@example.com",
    subject: "Follow-up on the Meridian Bank system",
    service: "Branding",
    message: "Could we extend the identity system to a new card product line?",
    status: "Read",
    receivedAt: "2026-07-15",
  },
  {
    id: "m4",
    name: "Marco Delgado",
    email: "marco.delgado@example.com",
    subject: "Storefront performance audit",
    service: "Web Development",
    message: "Our LCP has crept back up over the last two releases — could you take a look?",
    status: "Replied",
    receivedAt: "2026-07-10",
  },
  {
    id: "m5",
    name: "Hana Suzuki",
    email: "hana.suzuki@example.com",
    subject: "AI triage assistant for support inbox",
    service: "AI",
    message: "We'd like something similar to the Clearline assistant for our own support inbox.",
    status: "Read",
    receivedAt: "2026-07-08",
  },
  {
    id: "m6",
    name: "Ola Bello",
    email: "ola.bello@example.com",
    subject: "General question about your process",
    service: "Other",
    message: "What does a typical engagement timeline look like end to end?",
    status: "Replied",
    receivedAt: "2026-06-29",
  },
];

export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "branding", label: "Brand Identity" },
  { value: "web-development", label: "Website Development" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "ai", label: "Artificial Intelligence" },
  { value: "other", label: "Something else" },
];
