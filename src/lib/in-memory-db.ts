// In-memory database fallback for AI Studio environment
// Mirrors Prisma Client API for Project, Testimonial, Message, Owner, SiteSettings, and Media.

export type InMemProject = {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: "BRANDING" | "WEB_DEVELOPMENT" | "DATA_ANALYSIS" | "AI";
  year: string;
  role: string;
  status: "DRAFT" | "PUBLISHED";
  liveLink: string | null;
  summary: string;
  description: string;
  tags: string[];
  overview: string;
  challenge: string;
  research: string;
  solution: string;
  resultStats: any;
  pdfFiles: string[];
  reviewToken: string | null;
  tokenExpiresAt: Date | null;
  heroImage: string | null;
  galleryImages: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type InMemTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  projectSlug: string | null;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InMemMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  service: "BRANDING" | "WEB_DEVELOPMENT" | "DATA_ANALYSIS" | "AI" | "OTHER";
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InMemOwner = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
};

export type InMemSiteSettings = {
  id: string;
  siteName: string;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
  language: string;
  direction: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  faviconUrl: string | null;
};

export type InMemMedia = {
  id: string;
  filename: string;
  url: string;
  type: string;
  createdAt: Date;
};

interface InMemoryState {
  projects: InMemProject[];
  testimonials: InMemTestimonial[];
  messages: InMemMessage[];
  owners: InMemOwner[];
  siteSettings: InMemSiteSettings[];
  media: InMemMedia[];
}

function getInitialState(): InMemoryState {
  const now = new Date();
  return {
    projects: [
      {
        id: "p1",
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
        pdfFiles: [],
        reviewToken: null,
        tokenExpiresAt: null,
        heroImage: null,
        galleryImages: [],
        createdAt: new Date("2025-01-15T00:00:00.000Z"),
        updatedAt: new Date("2025-11-02T00:00:00.000Z"),
      },
      {
        id: "p2",
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
        pdfFiles: [],
        reviewToken: null,
        tokenExpiresAt: null,
        heroImage: null,
        galleryImages: [],
        createdAt: new Date("2025-02-10T00:00:00.000Z"),
        updatedAt: new Date("2025-10-15T00:00:00.000Z"),
      },
      {
        id: "p3",
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
        pdfFiles: [],
        reviewToken: null,
        tokenExpiresAt: null,
        heroImage: null,
        galleryImages: [],
        createdAt: new Date("2024-04-12T00:00:00.000Z"),
        updatedAt: new Date("2024-09-20T00:00:00.000Z"),
      },
      {
        id: "p4",
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
        pdfFiles: [],
        reviewToken: null,
        tokenExpiresAt: null,
        heroImage: null,
        galleryImages: [],
        createdAt: new Date("2025-03-01T00:00:00.000Z"),
        updatedAt: new Date("2025-08-14T00:00:00.000Z"),
      },
      {
        id: "p5",
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
        pdfFiles: [],
        reviewToken: null,
        tokenExpiresAt: null,
        heroImage: null,
        galleryImages: [],
        createdAt: new Date("2024-01-20T00:00:00.000Z"),
        updatedAt: new Date("2025-03-11T00:00:00.000Z"),
      },
      {
        id: "p6",
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
        pdfFiles: [],
        reviewToken: null,
        tokenExpiresAt: null,
        heroImage: null,
        galleryImages: [],
        createdAt: new Date("2024-05-15T00:00:00.000Z"),
        updatedAt: new Date("2026-07-01T00:00:00.000Z"),
      },
    ],
    testimonials: [
      {
        id: "t1",
        quote: "F Studio rebuilt our identity and our storefront in the same quarter, and both felt like they came from one coherent system.",
        author: "Dana Whitfield",
        role: "Marketing Director, Atlas Outfitters",
        rating: 5,
        projectSlug: "atlas-web-platform",
        status: "APPROVED",
        submittedAt: new Date("2025-06-01T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "t2",
        quote: "The dashboard finally gave our dispatch team one place to look instead of three.",
        author: "Marcus Iyer",
        role: "Operations Lead, Northpoint Logistics",
        rating: 4.8,
        projectSlug: "northpoint-dashboard",
        status: "APPROVED",
        submittedAt: new Date("2025-06-10T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "t3",
        quote: "Our new mark scales from a favicon to a branch sign without losing its character.",
        author: "Priya Anand",
        role: "Brand Manager, Meridian Bank",
        rating: 5,
        projectSlug: "meridian-bank-identity",
        status: "APPROVED",
        submittedAt: new Date("2025-06-15T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "t4",
        quote: "The assistant explains its routing decisions, which made our support team trust it fast.",
        author: "Tomás Rivera",
        role: "Support Lead, Clearline Insurance",
        rating: 4.7,
        projectSlug: "clearline-ai-assistant",
        status: "PENDING",
        submittedAt: new Date("2025-06-20T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "t5",
        quote: "Calm, precise, and delivered exactly the sizes we needed for every surface.",
        author: "El Fassi Amina",
        role: "Founder, Solace Wellness",
        rating: 4.9,
        projectSlug: "solace-wordmark",
        status: "HIDDEN",
        submittedAt: new Date("2025-06-25T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
    ],
    messages: [
      {
        id: "m1",
        name: "Elena Cross",
        email: "elena.cross@example.com",
        subject: "Brand refresh for a Series B launch",
        service: "BRANDING",
        message: "We're raising a Series B and want an identity refresh before the announcement. Do you have capacity this quarter?",
        status: "NEW",
        receivedAt: new Date("2026-08-01T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "m2",
        name: "Jonah Whit",
        email: "jonah.whit@example.com",
        subject: "Dashboard for warehouse throughput",
        service: "DATA_ANALYSIS",
        message: "Looking for a dashboard that consolidates three warehouse systems into one throughput view.",
        status: "NEW",
        receivedAt: new Date("2026-08-02T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "m3",
        name: "Priya Anand",
        email: "priya.anand@example.com",
        subject: "Follow-up on the Meridian Bank system",
        service: "BRANDING",
        message: "Could we extend the identity system to a new card product line?",
        status: "READ",
        receivedAt: new Date("2026-08-03T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "m4",
        name: "Marco Delgado",
        email: "marco.delgado@example.com",
        subject: "Storefront performance audit",
        service: "WEB_DEVELOPMENT",
        message: "Our LCP has crept back up over the last two releases — could you take a look?",
        status: "REPLIED",
        receivedAt: new Date("2026-08-04T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "m5",
        name: "Hana Suzuki",
        email: "hana.suzuki@example.com",
        subject: "AI triage assistant for support inbox",
        service: "AI",
        message: "We'd like something similar to the Clearline assistant for our own support inbox.",
        status: "READ",
        receivedAt: new Date("2026-08-05T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "m6",
        name: "Ola Bello",
        email: "ola.bello@example.com",
        subject: "General question about your process",
        service: "OTHER",
        message: "What does a typical engagement timeline look like end to end?",
        status: "REPLIED",
        receivedAt: new Date("2026-08-06T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
    ],
    owners: [],
    siteSettings: [
      {
        id: "default-settings",
        siteName: "F Studio",
        description: "F Studio — digital design & technology solutions.",
        language: "en",
        direction: "ltr",
        logoUrl: null,
        faviconUrl: "/favicon.ico",
        email: "hello@fstudio.example",
        phone: "+1 (555) 010-2024",
        address: "Studio 4B, Design District",
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        createdAt: now,
        updatedAt: now,
      },
    ],
    media: [],
  };
}

const globalStore = globalThis as unknown as {
  __fStudioStore?: InMemoryState;
};

if (!globalStore.__fStudioStore) {
  globalStore.__fStudioStore = getInitialState();
}

export const inMemoryDb = globalStore.__fStudioStore;

function generateId(): string {
  return "c" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function matchesFilter(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const val = where[key];
    if (val === undefined) continue;
    if (val === null) {
      if (item[key] !== null && item[key] !== undefined) return false;
    } else if (typeof val === "object" && val instanceof Date) {
      if (!(item[key] instanceof Date) || item[key].getTime() !== val.getTime()) return false;
    } else if (typeof val === "object") {
      // Comparison operator like { gte, lte, gt, lt }
      if (val.gt !== undefined && !(item[key] > val.gt)) return false;
      if (val.gte !== undefined && !(item[key] >= val.gte)) return false;
      if (val.lt !== undefined && !(item[key] < val.lt)) return false;
      if (val.lte !== undefined && !(item[key] <= val.lte)) return false;
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

function projectSelect(item: any, select?: any): any {
  if (!select) return item;
  const result: any = {};
  for (const key of Object.keys(select)) {
    if (select[key]) {
      result[key] = item[key];
    }
  }
  return result;
}

function clone<T>(val: T): T {
  if (val === null || typeof val !== "object") return val;
  if (val instanceof Date) return new Date(val.getTime()) as any;
  if (Array.isArray(val)) return val.map(clone) as any;
  const res: any = {};
  for (const k of Object.keys(val)) {
    res[k] = clone((val as any)[k]);
  }
  return res;
}

export function createInMemoryModelHandler(collectionName: keyof InMemoryState) {
  const collection = () => inMemoryDb[collectionName] as any[];

  return {
    findMany: async (args?: { where?: any; orderBy?: any; select?: any }) => {
      let items = collection().filter((item) => matchesFilter(item, args?.where));

      if (args?.orderBy) {
        const orderKey = Object.keys(args.orderBy)[0];
        const direction = args.orderBy[orderKey] === "asc" ? 1 : -1;
        items = [...items].sort((a, b) => {
          const valA = a[orderKey] instanceof Date ? a[orderKey].getTime() : a[orderKey];
          const valB = b[orderKey] instanceof Date ? b[orderKey].getTime() : b[orderKey];
          if (valA < valB) return -1 * direction;
          if (valA > valB) return 1 * direction;
          return 0;
        });
      }

      return items.map((i) => projectSelect(clone(i), args?.select));
    },

    findUnique: async (args: { where: any; select?: any }) => {
      const item = collection().find((i) => matchesFilter(i, args.where));
      if (!item) return null;
      return projectSelect(clone(item), args.select);
    },

    findFirst: async (args?: { where?: any; select?: any }) => {
      const item = collection().find((i) => matchesFilter(i, args?.where));
      if (!item) return null;
      return projectSelect(clone(item), args?.select);
    },

    create: async (args: { data: any }) => {
      const now = new Date();
      const newItem = {
        id: generateId(),
        ...args.data,
        createdAt: args.data.createdAt ?? now,
        updatedAt: args.data.updatedAt ?? now,
      };
      collection().push(newItem);
      return clone(newItem);
    },

    createMany: async (args: { data: any[] }) => {
      const now = new Date();
      for (const d of args.data) {
        collection().push({
          id: generateId(),
          ...d,
          createdAt: d.createdAt ?? now,
          updatedAt: d.updatedAt ?? now,
        });
      }
      return { count: args.data.length };
    },

    update: async (args: { where: any; data: any }) => {
      const idx = collection().findIndex((i) => matchesFilter(i, args.where));
      if (idx === -1) {
        throw new Error(`Record to update not found.`);
      }
      const existing = collection()[idx];
      const updated = {
        ...existing,
        ...args.data,
        updatedAt: new Date(),
      };
      collection()[idx] = updated;
      return clone(updated);
    },

    upsert: async (args: { where: any; update: any; create: any }) => {
      const idx = collection().findIndex((i) => matchesFilter(i, args.where));
      if (idx !== -1) {
        const existing = collection()[idx];
        const updated = {
          ...existing,
          ...args.update,
          updatedAt: new Date(),
        };
        collection()[idx] = updated;
        return clone(updated);
      } else {
        const now = new Date();
        const created = {
          id: generateId(),
          ...args.create,
          createdAt: args.create.createdAt ?? now,
          updatedAt: args.create.updatedAt ?? now,
        };
        collection().push(created);
        return clone(created);
      }
    },

    delete: async (args: { where: any }) => {
      const idx = collection().findIndex((i) => matchesFilter(i, args.where));
      if (idx === -1) {
        throw new Error(`Record to delete not found.`);
      }
      const [removed] = collection().splice(idx, 1);
      return clone(removed);
    },

    count: async (args?: { where?: any }) => {
      if (!args?.where) return collection().length;
      return collection().filter((item) => matchesFilter(item, args.where)).length;
    },
  };
}

export function createInMemoryPrismaClient() {
  return {
    project: createInMemoryModelHandler("projects"),
    testimonial: createInMemoryModelHandler("testimonials"),
    message: createInMemoryModelHandler("messages"),
    owner: createInMemoryModelHandler("owners"),
    siteSettings: createInMemoryModelHandler("siteSettings"),
    media: createInMemoryModelHandler("media"),
    $disconnect: async () => {},
  };
}
