// Static content for the five fixed F Studio services (Component_List §14.1).
// Not a database entity — services are a fixed set per the locked scope.

export type ServiceContent = {
  slug: string;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
};

export const SERVICES: ServiceContent[] = [
  {
    slug: "logo-design",
    title: "Logo Design",
    description: "Distinct marks built to hold up from a favicon to a storefront sign.",
    benefits: [
      "Wordmark, monogram, and stacked lockup variants",
      "Legibility tested down to 16px",
      "Light and dark background variants included",
    ],
    ctaLabel: "Request branding",
  },
  {
    slug: "brand-identity",
    title: "Brand Identity",
    description: "A full system — color, type, and application rules — not just a logo.",
    benefits: [
      "Color and typography system with usage rules",
      "Application mockups across real touchpoints",
      "A guidelines document your team can hand off",
    ],
    ctaLabel: "Request branding",
  },
  {
    slug: "website-development",
    title: "Website Development",
    description: "Fast, accessible sites built on Next.js, engineered for maintainability.",
    benefits: [
      "Performance-first builds with responsive imagery",
      "WCAG 2.2 AA accessibility as a baseline, not an add-on",
      "Structured for RTL/LTR from the first component",
    ],
    ctaLabel: "Start a project",
  },
  {
    slug: "data-analysis",
    title: "Data Analysis",
    description: "Dashboards that replace scattered spreadsheets with one clear view.",
    benefits: [
      "Stat blocks and charts with accessible data fallbacks",
      "Neutral palette with a single accent series",
      "Built around the metrics your team checks daily",
    ],
    ctaLabel: "See data work",
  },
  {
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    description: "Practical AI features focused on outcomes, not hype visuals.",
    benefits: [
      "Assistants and automations scoped to a real workflow",
      "Clear, explainable outputs over black-box decisions",
      "Same calm, technical treatment as our data work",
    ],
    ctaLabel: "See AI work",
  },
];
