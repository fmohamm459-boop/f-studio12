// Phase 9.3.9 — optional convenience seed.
//
// Populates the three approved models (Project, Testimonial, Message) with
// the same content that used to live in src/lib/mock-data.ts, so a freshly
// migrated database isn't empty the first time the app is pointed at it.
// This is NOT run automatically (no postinstall/prisma hook) — run it
// yourself, once, after `npx prisma migrate deploy` (or `migrate dev`):
//
//   node prisma/seed.mjs
//
// Safe to re-run: it upserts by the same unique keys the schema already
// defines (Project.slug). Testimonial/Message have no natural unique key in
// the schema, so re-running will insert duplicates — only run this against
// an empty table, or clear the tables first.
//
// Plain Node + @prisma/client (no ts-node/tsx dependency) so it runs with
// whatever Node the project already has installed.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projects = [
  {
    slug: "meridian-bank-identity",
    title: "Meridian Bank Identity",
    client: "Meridian Bank",
    category: "BRANDING",
    year: "2025",
    role: "Brand Identity, Logo Design",
    status: "PUBLISHED",
    liveLink: null,
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
    category: "DATA_ANALYSIS",
    year: "2025",
    role: "Data Analysis, Dashboard Design",
    status: "PUBLISHED",
    liveLink: null,
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
    category: "WEB_DEVELOPMENT",
    year: "2024",
    role: "Website Development",
    status: "PUBLISHED",
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
    status: "DRAFT",
    liveLink: null,
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
    category: "BRANDING",
    year: "2024",
    role: "Logo Design",
    status: "PUBLISHED",
    liveLink: null,
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
    category: "WEB_DEVELOPMENT",
    year: "2024",
    role: "Website Development, Data Analysis",
    status: "DRAFT",
    liveLink: null,
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

const testimonials = [
  {
    quote:
      "F Studio rebuilt our identity and our storefront in the same quarter, and both felt like they came from one coherent system.",
    author: "Dana Whitfield",
    role: "Marketing Director, Atlas Outfitters",
    rating: 5,
    projectSlug: "atlas-web-platform",
    status: "APPROVED",
  },
  {
    quote: "The dashboard finally gave our dispatch team one place to look instead of three.",
    author: "Marcus Iyer",
    role: "Operations Lead, Northpoint Logistics",
    rating: 4.8,
    projectSlug: "northpoint-dashboard",
    status: "APPROVED",
  },
  {
    quote: "Our new mark scales from a favicon to a branch sign without losing its character.",
    author: "Priya Anand",
    role: "Brand Manager, Meridian Bank",
    rating: 5,
    projectSlug: "meridian-bank-identity",
    status: "APPROVED",
  },
  {
    quote: "The assistant explains its routing decisions, which made our support team trust it fast.",
    author: "Tomás Rivera",
    role: "Support Lead, Clearline Insurance",
    rating: 4.7,
    projectSlug: "clearline-ai-assistant",
    status: "PENDING",
  },
  {
    quote: "Calm, precise, and delivered exactly the sizes we needed for every surface.",
    author: "El Fassi Amina",
    role: "Founder, Solace Wellness",
    rating: 4.9,
    projectSlug: "solace-wordmark",
    status: "HIDDEN",
  },
];

const messages = [
  {
    name: "Elena Cross",
    email: "elena.cross@example.com",
    subject: "Brand refresh for a Series B launch",
    service: "BRANDING",
    message:
      "We're raising a Series B and want an identity refresh before the announcement. Do you have capacity this quarter?",
    status: "NEW",
  },
  {
    name: "Jonah Whit",
    email: "jonah.whit@example.com",
    subject: "Dashboard for warehouse throughput",
    service: "DATA_ANALYSIS",
    message: "Looking for a dashboard that consolidates three warehouse systems into one throughput view.",
    status: "NEW",
  },
  {
    name: "Priya Anand",
    email: "priya.anand@example.com",
    subject: "Follow-up on the Meridian Bank system",
    service: "BRANDING",
    message: "Could we extend the identity system to a new card product line?",
    status: "READ",
  },
  {
    name: "Marco Delgado",
    email: "marco.delgado@example.com",
    subject: "Storefront performance audit",
    service: "WEB_DEVELOPMENT",
    message: "Our LCP has crept back up over the last two releases — could you take a look?",
    status: "REPLIED",
  },
  {
    name: "Hana Suzuki",
    email: "hana.suzuki@example.com",
    subject: "AI triage assistant for support inbox",
    service: "AI",
    message: "We'd like something similar to the Clearline assistant for our own support inbox.",
    status: "READ",
  },
  {
    name: "Ola Bello",
    email: "ola.bello@example.com",
    subject: "General question about your process",
    service: "OTHER",
    message: "What does a typical engagement timeline look like end to end?",
    status: "REPLIED",
  },
];

async function main() {
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }

  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    await prisma.testimonial.createMany({ data: testimonials });
  } else {
    console.log("Testimonial table is not empty — skipping (no natural unique key to upsert on).");
  }

  const existingMessages = await prisma.message.count();
  if (existingMessages === 0) {
    await prisma.message.createMany({ data: messages });
  } else {
    console.log("Message table is not empty — skipping (no natural unique key to upsert on).");
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
