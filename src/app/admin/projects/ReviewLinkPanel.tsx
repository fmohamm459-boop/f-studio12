"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { generateReviewLink, getReviewLink } from "@/lib/actions/review";

type ReviewLinkPanelProps = {
  slug: string;
  title: string;
  onClose: () => void;
};

type LinkState =
  | { status: "loading" }
  | { status: "none" }
  | { status: "ready"; reviewToken: string; tokenExpiresAt: Date }
  | { status: "error"; message: string };

function formatExpiry(date: Date): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path
        d="M7.5 10.5 10.5 7.5M8 5 9.3 3.7a2.5 2.5 0 1 1 3.5 3.5L11.5 8.5M10 13 8.7 14.3a2.5 2.5 0 1 1-3.5-3.5L6.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Review Link panel (Phase 9.3.11 Stage 3, Projects Management row action
 * "Review link"). Centered modal — deliberately lighter-weight than the
 * Project Editor's side drawer (§15.5), since this is a single self-
 * contained utility action rather than a form.
 *
 * On open, reads any existing active token via `getReviewLink` so a
 * previously generated link can be viewed/copied without minting a new
 * one; "Generate"/"Regenerate" call `generateReviewLink`, whose silent-
 * overwrite behavior is unchanged from Stage 1 (confirmed intentional).
 */
export function ReviewLinkPanel({ slug, title, onClose }: ReviewLinkPanelProps) {
  const [state, setState] = useState<LinkState>({ status: "loading" });
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getReviewLink(slug)
      .then((result) => {
        if (cancelled) return;
        setState(result ? { status: "ready", ...result } : { status: "none" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Couldn't check for an existing link." });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function handleGenerate() {
    setCopied(false);
    startTransition(async () => {
      try {
        const result = await generateReviewLink(slug);
        setState({ status: "ready", ...result });
      } catch {
        setState({ status: "error", message: "Couldn't generate a review link. Please try again." });
      }
    });
  }

  async function handleCopy(reviewToken: string) {
    const url = `${window.location.origin}/review/${reviewToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setState({ status: "error", message: "Couldn't copy the link — you can select and copy it manually." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close review link panel"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Review link for ${title}`}
        className="relative flex w-full max-w-md flex-col rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-6 shadow-[var(--shadow-md)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LinkIcon className="shrink-0 text-primary" />
            <h2 className="font-sans text-lg font-semibold text-foreground">Review link</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review link panel"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/70 hover:bg-surface hover:text-foreground"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="mt-1 text-sm text-foreground/60">{title}</p>

        <div className="mt-6">
          {state.status === "loading" ? (
            <p className="text-sm text-foreground/60">Checking for an existing link…</p>
          ) : null}

          {state.status === "error" ? (
            <p role="alert" className="text-sm text-foreground">
              {state.message}
            </p>
          ) : null}

          {state.status === "none" ? (
            <div>
              <p className="text-sm text-foreground/70">
                No active review link for this project yet.
              </p>
              <Button type="button" onClick={handleGenerate} className="mt-4" aria-busy={isPending}>
                {isPending ? "Generating…" : "Generate review link"}
              </Button>
            </div>
          ) : null}

          {state.status === "ready" ? (
            <div>
              <label htmlFor="review-link-url" className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                Private link
              </label>
              <div className="mt-2 flex items-stretch gap-2">
                <input
                  id="review-link-url"
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/review/${state.reviewToken}`}
                  onFocus={(event) => event.currentTarget.select()}
                  className="min-w-0 flex-1 truncate rounded-[var(--radius-lg)] border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(state.reviewToken)}
                  className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-[var(--radius-lg)] border border-border px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <CopyIcon />
                  Copy
                </button>
              </div>
              <p role="status" className="mt-2 min-h-[1.25rem] text-xs text-primary">
                {copied ? "Copied to clipboard." : ""}
              </p>

              <p className="mt-3 text-xs text-foreground/50">
                Expires {formatExpiry(state.tokenExpiresAt)}
              </p>

              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerate}
                className="mt-5"
                aria-busy={isPending}
              >
                {isPending ? "Regenerating…" : "Regenerate link"}
              </Button>
              <p className="mt-2 text-xs text-foreground/50">
                Regenerating replaces this link — the previous one stops working immediately.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
