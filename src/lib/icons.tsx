// Line icon assets for the five services (UI_Guidelines §14.3 — ~1.5px stroke,
// one consistent metaphor per service, decorative/aria-hidden when a text
// title is present). These are inline SVG markup, not a reusable UI
// component in the Component_List sense — ServiceCard renders them via its
// existing `icon` prop.

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LogoDesignIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...strokeProps}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M7 12h10" />
    </svg>
  );
}

export function BrandIdentityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...strokeProps}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  );
}

export function WebDevelopmentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...strokeProps}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 9h18" />
      <path d="M9 14l-2 2 2 2M15 14l2 2-2 2" />
    </svg>
  );
}

export function DataAnalysisIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...strokeProps}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function AIIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...strokeProps}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
