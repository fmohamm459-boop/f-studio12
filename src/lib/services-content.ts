import type { Locale } from "@/i18n/config";

// Static content for the five fixed F Studio services (Component_List §14.1).
// Not a database entity — services are a fixed set per the locked scope.

export type ServiceContent = {
  slug: string;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
};

export const SERVICES_EN: ServiceContent[] = [
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

export const SERVICES_AR: ServiceContent[] = [
  {
    slug: "logo-design",
    title: "تصميم الشعارات",
    description: "علامات مميزة مصممة لتصمد وتبرز من الأيقونات المصغرة (Favicon) وحتى لافتات المباني.",
    benefits: [
      "نسخ للعلامة النصية والمونوغرام والتراكيب الرأسية",
      "اختبار الوضوح بدقة حتى مقاس 16 بكسل",
      "تشمل نسخاً مخصصة للخلفيات الفاتحة والداكنة",
    ],
    ctaLabel: "طلب خدمات الهوية",
  },
  {
    slug: "brand-identity",
    title: "الهوية البصرية",
    description: "نظام متكامل يشمل الألوان والطباعة وقواعد التطبيق، وليس مجرد شعار.",
    benefits: [
      "نظام الألوان والخطوط مع إرشادات الاستخدام الدقيقة",
      "نماذج تطبيق واقعية على كافة نقاط الاتصال",
      "دليل إرشادي شامل يمكن لفريقكم اعتماده وتسليمه",
    ],
    ctaLabel: "طلب خدمات الهوية",
  },
  {
    slug: "website-development",
    title: "تطوير المواقع والمنصات",
    description: "مواقع سريعة وسهلة الوصول مبنية بتقنية Next.js، مصممة لأعلى درجات الاستدامة.",
    benefits: [
      "بنية عالية الأداء مع معالجة متقدمة واستجابة للصور",
      "معايير سهولة الوصول WCAG 2.2 AA كركيزة أساسية وليست خياراً إضافياً",
      "دعم كامل وفوري لاتجاهي LTR وRTL من أول مكوّن",
    ],
    ctaLabel: "بدء مشروع",
  },
  {
    slug: "data-analysis",
    title: "تحليل البيانات ولوحات التحكم",
    description: "لوحات تحكم ذكية تستبدل الجداول المشتتة برؤية بصرية موحدة وواضحة.",
    benefits: [
      "كتل إحصائية ورسوم بيانية مع بدائل وصول رقمية سهلة القراءة",
      "لوحة ألوان متوازنة مع خط تمييزي واحد للأرقام الحيوية",
      "مصممة بدقة حول المقاييس التي يتابعها فريقكم يومياً",
    ],
    ctaLabel: "استعراض أعمال البيانات",
  },
  {
    slug: "artificial-intelligence",
    title: "الذكاء الاصطناعي",
    description: "ميزات وحلول ذكاء اصطناعي عملية تركز على النتائج الحقيقية وتجنب المظاهر الزائفة.",
    benefits: [
      "مساعدات ذكية وأتمتة مخصصة لتدفقات العمل الفعلية",
      "مخرجات واضحة وقابلة للتفسير بعيداً عن الصناديق المغلقة",
      "نفس الطابع الهادئ والاحترافي المعتمد في أنظمة البيانات لدينا",
    ],
    ctaLabel: "استعراض أعمال الذكاء الاصطناعي",
  },
];

export const SERVICES: ServiceContent[] = SERVICES_EN;

export function getLocalizedServices(locale: Locale): ServiceContent[] {
  return locale === "ar" ? SERVICES_AR : SERVICES_EN;
}
