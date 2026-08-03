import type {
  Project as PrismaProject,
  Testimonial as PrismaTestimonial,
  Message as PrismaMessage,
  ProjectCategory as PrismaProjectCategory,
  ProjectStatus as PrismaProjectStatus,
  TestimonialStatus as PrismaTestimonialStatus,
  MessageService as PrismaMessageService,
  MessageStatus as PrismaMessageStatus,
} from "@prisma/client";
import type {
  Project,
  ProjectCategory,
  ProjectStatus,
  Testimonial,
  TestimonialStatus,
  Message,
  MessageStatus,
} from "@/lib/mock-data";

// Phase 9.3.9 — Database Integration.
//
// Every public/admin page and component was built (Phase 9.3.7) against the
// string-literal shapes in src/lib/mock-data.ts (e.g. category: "Branding",
// status: "Published"). Phase 9.3.8's Prisma schema mirrors those shapes
// field-for-field but stores category/status as enums (BRANDING, PUBLISHED).
// These helpers translate one way at the read boundary (DB -> UI shape) and
// the other way at the write boundary (UI shape -> DB), so no page,
// component, or prop type had to change to consume real data.

const CATEGORY_TO_UI: Record<PrismaProjectCategory, ProjectCategory> = {
  BRANDING: "Branding",
  WEB_DEVELOPMENT: "Web Development",
  DATA_ANALYSIS: "Data Analysis",
  AI: "AI",
};

const CATEGORY_TO_DB: Record<ProjectCategory, PrismaProjectCategory> = {
  Branding: "BRANDING",
  "Web Development": "WEB_DEVELOPMENT",
  "Data Analysis": "DATA_ANALYSIS",
  AI: "AI",
};

const PROJECT_STATUS_TO_UI: Record<PrismaProjectStatus, ProjectStatus> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

const PROJECT_STATUS_TO_DB: Record<ProjectStatus, PrismaProjectStatus> = {
  Draft: "DRAFT",
  Published: "PUBLISHED",
};

const TESTIMONIAL_STATUS_TO_UI: Record<PrismaTestimonialStatus, TestimonialStatus> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  HIDDEN: "Hidden",
};

const TESTIMONIAL_STATUS_TO_DB: Record<TestimonialStatus, PrismaTestimonialStatus> = {
  Pending: "PENDING",
  Approved: "APPROVED",
  Hidden: "HIDDEN",
};

const MESSAGE_SERVICE_TO_UI: Record<PrismaMessageService, Message["service"]> = {
  BRANDING: "Branding",
  WEB_DEVELOPMENT: "Web Development",
  DATA_ANALYSIS: "Data Analysis",
  AI: "AI",
  OTHER: "Other",
};

const MESSAGE_STATUS_TO_UI: Record<PrismaMessageStatus, MessageStatus> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
};

export function categoryToUi(value: PrismaProjectCategory): ProjectCategory {
  return CATEGORY_TO_UI[value];
}

export function categoryToDb(value: ProjectCategory): PrismaProjectCategory {
  return CATEGORY_TO_DB[value];
}

export function projectStatusToUi(value: PrismaProjectStatus): ProjectStatus {
  return PROJECT_STATUS_TO_UI[value];
}

export function projectStatusToDb(value: ProjectStatus): PrismaProjectStatus {
  return PROJECT_STATUS_TO_DB[value];
}

export function testimonialStatusToUi(value: PrismaTestimonialStatus): TestimonialStatus {
  return TESTIMONIAL_STATUS_TO_UI[value];
}

export function testimonialStatusToDb(value: TestimonialStatus): PrismaTestimonialStatus {
  return TESTIMONIAL_STATUS_TO_DB[value];
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** DB row -> the `Project` shape every page/component already renders. */
export function toUiProject(row: PrismaProject): Project {
  return {
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: categoryToUi(row.category),
    year: row.year,
    role: row.role,
    status: projectStatusToUi(row.status),
    updatedAt: toDateOnly(row.updatedAt),
    liveLink: row.liveLink ?? undefined,
    summary: row.summary,
    description: row.description,
    tags: row.tags,
    overview: row.overview,
    challenge: row.challenge,
    research: row.research,
    solution: row.solution,
    resultStats: row.resultStats as Project["resultStats"],
    pdfFiles: row.pdfFiles,
    heroImage: row.heroImage ?? undefined,
    galleryImages: row.galleryImages,
  };
}

/** DB row -> the `Testimonial` shape every page/component already renders. */
export function toUiTestimonial(row: PrismaTestimonial): Testimonial {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role,
    rating: row.rating,
    projectSlug: row.projectSlug ?? undefined,
    status: testimonialStatusToUi(row.status),
    submittedAt: toDateOnly(row.submittedAt),
  };
}

/** DB row -> the `Message` shape every page/component already renders. */
export function toUiMessage(row: PrismaMessage): Message {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    service: MESSAGE_SERVICE_TO_UI[row.service],
    message: row.message,
    status: MESSAGE_STATUS_TO_UI[row.status],
    receivedAt: toDateOnly(row.receivedAt),
  };
}
