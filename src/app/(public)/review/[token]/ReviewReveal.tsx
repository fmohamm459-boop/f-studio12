"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type ReviewRevealProps = {
  description: string;
  projectLink: string | null;
  pdfFiles: string[];
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M4.5 6.75 9 11.25l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M6.5 3H3.5a1 1 0 0 0-1 1v8.5a1 1 0 0 0 1 1H12a1 1 0 0 0 1-1V9.5M9.5 2.5H13.5V6.5M13 3 7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M6 2.5h5.5L16 7v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 2.5V7H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Best-effort, cosmetic-only filename from a stored file URL. Never used
 * for anything but the visible label — the actual download always uses
 * the full original `href`. */
function fileLabel(url: string, index: number): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    // Not a parseable absolute URL — fall through to the generic label.
  }
  return `Resource ${index + 1}`;
}

/**
 * Interactive Reveal (Phase 9.3.11 Stage 2, Task 2/3). A single expandable
 * card — Component_List has no dedicated Accordion primitive yet, so this
 * follows the same expand/collapse mechanics as the admin Settings
 * accordion-style section nav (button + `aria-expanded`/`aria-controls`),
 * built as its own component here since this page's needs (external link,
 * file list) are specific to the review presentation.
 *
 * Animates height/opacity with framer-motion (already a project dependency,
 * used the same way in SideNavBar's mobile drawer) at the 120–180ms "quiet"
 * duration UI_Guidelines §19.2 specifies, and collapses to a instant toggle
 * under `prefers-reduced-motion`.
 */
export function ReviewReveal({ description, projectLink, pdfFiles }: ReviewRevealProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-elevated shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex min-h-[44px] w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors duration-150 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-8 sm:py-6"
      >
        <span>
          <span className="block font-sans text-base font-semibold text-foreground">
            Project details
          </span>
          <span className="mt-0.5 block text-sm text-foreground/60">
            Description, project link, and downloadable resources
          </span>
        </span>
        <ChevronIcon
          className={`shrink-0 text-foreground/60 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-border px-6 py-8 sm:px-8">
              {/* Project Information / Description */}
              <div>
                <h2 className="font-sans text-lg font-semibold text-foreground">
                  About this project
                </h2>
                <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-foreground/70">
                  {description}
                </p>
              </div>

              {/* View Project link */}
              {projectLink ? (
                <div className="mt-8">
                  <a
                    href={projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-lg)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity duration-150 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    View project
                    <ExternalLinkIcon />
                  </a>
                </div>
              ) : null}

              {/* Download Resources */}
              <div className="mt-10">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground/60">
                  Download resources
                </h3>

                {pdfFiles.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pdfFiles.map((url, index) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-sm text-foreground transition-colors duration-150 hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <DocumentIcon className="shrink-0 text-primary" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {fileLabel(url, index)}
                            </span>
                            <span className="block text-xs text-foreground/50">Download PDF</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-foreground/50">
                    No resources have been shared for this project yet.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
