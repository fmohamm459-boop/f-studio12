# F Studio — Phase 9.3.11 Implementation Auditing & Compliance Report
## Client Review System via Private Token Links

**Scope covered by this report:** all of Phase 9.3.11 delivered so far —
Stage 1 (Schema & Server Actions), Stage 2 (Public Review Page UI), and
Stage 3 (Admin Projects Management wiring) — audited together against
`Page_Structure.md`, `Component_List.md`, `UI_Guidelines.md`, and the
Phase 9.3 Decision Record, per this phase's source-of-truth priority.

**Environment note:** as in every prior phase, this sandbox has no
network access, so `npm install`, `prisma generate`, and `next
build`/`tsc --noEmit` could not be run against real dependencies. Every
file below was hand-written and re-checked (brace/paren balance verified
programmatically; the cumulative diff against the Phase 9.3.10-A upload
confirms the file list below is exhaustive), but a real build/typecheck
has not been executed.

---

## 1. Architecture Framework Alignment

### 1.1 Decision Record compliance

| Decision Record 002 requirement | Status |
|---|---|
| No `Client` or `User` model | ✅ `prisma/schema.prisma` still has exactly 3 models — `Project`, `Testimonial`, `Message` (see §5) |
| No client accounts, no client login | ✅ `/review/[token]` requires no account — a token in the URL is the only credential |
| No role/permission system | ✅ none added |
| Private-link model: *"Admin creates review request → Private token link generated → Client opens review page → Client submits feedback"* | ⚠️ **Partially implemented, by design.** This phase built the first three steps (admin generates a token, a private link exists, the client can open it and see the project). "Client submits feedback" — a write path back to the database — was **not** requested in Stages 1–3 and was not built. `/review/[token]` is read-only. See §8. |
| Implementing the private-link model requires "its own separate, explicitly approved phase" | ✅ Phase 9.3.11 is that phase — explicitly scoped and approved turn-by-turn (schema, then public UI, then admin UI) |

### 1.2 Page_Structure.md alignment

- **§9 Client Review** describes the *static feedback-form* page
  (`/client-review` — Hero, Preview, Feedback Form, Guidelines), built in
  an earlier phase and **untouched** by Phase 9.3.11. The new
  `/review/[token]` route is a **distinct, additional** route — the
  private, per-project presentation page Decision Record 002 anticipated
  as future work, not a replacement for §9. Both routes now coexist; see
  §5 for the resulting public-route count.
- **PART B §13 Projects Management** — "Management Table: Sortable grid
  with row actions (Edit, View, Delete)". Stage 3 adds a fourth row
  action, "Review link". This extends the documented action set rather
  than replacing it; `Component_List §15.4` (Tables) requires row actions
  to sit on reading-end and be individually labeled — the new action
  follows the same `DataTableRowAction` mechanism the existing three
  already use, so it inherits that behavior for free.
- **PART C Technical Requirements** — WCAG 2.2 AA, 44px targets, RTL via
  logical properties: honored throughout (see §7).

### 1.3 Component_List.md alignment

- **§15.4 Tables** — the new row action reuses the existing
  `DataTable`/`DataTableRowAction` primitive verbatim; no table markup
  was changed.
- **§15.6 Empty States (admin)** — "no active review link" and "no PDF
  resources" states are both explicit, informative, action-oriented text
  (never a blank area), per this section's rule.
- No dedicated **Accordion** primitive exists yet in the component
  library (only a Settings-page tab/accordion-hybrid pattern exists, and
  no `Component_List` entry names "Accordion" as a built primitive). The
  Stage 2 "Interactive Reveal" (`ReviewReveal.tsx`) and Stage 3 "Review
  link" panel (`ReviewLinkPanel.tsx`) are therefore each purpose-built,
  following the same expand/collapse and modal *mechanics* already
  established in this codebase (`aria-expanded`/`aria-controls`; the
  `role="dialog"` + backdrop-button + focus-visible-close pattern from
  the existing Project Editor drawer) rather than introducing new
  patterns.
- **§13 Portfolio Experience Guidelines** — not applicable to the review
  page; it intentionally does not reuse Project Card anatomy (media →
  category → title → …) since it's a single-project utility page, not a
  portfolio listing.

### 1.4 UI_Guidelines.md alignment

- **§19.1 Premium but Simple** — the review page is intentionally sparse:
  one hero, one expandable section, no decorative filler.
- **§19.2 Technical Personality** — mono-label eyebrow ("Private review"),
  hairline borders, quiet 120–180ms micro-interactions.
- **§18.6 Brand Color Application** — `--primary` (teal) used only for the
  "View project" CTA, the copy-confirmation text, and small icon accents —
  well under the ≤10%-of-surface guidance; no accent-on-accent stacking.
- **A11y (throughout)** — see §7 for the full checklist.
- **RTL** — logical properties (`text-start`, `ps-*`/`pe-*` where
  directional, `me-*`) used throughout the new UI; no new hardcoded
  `left`/`right`. The copy-link icon and document icon are direction-
  neutral glyphs (not directional arrows), so neither needs an RTL
  mirror rule.

---

## 2. Created files

| File | Stage | Purpose |
|---|---|---|
| `src/lib/actions/review.ts` | 1 (Stage 3 extended it) | `generateReviewLink`, `getReviewLink`, `validateReviewToken` Server Actions. See §6 for the Stage 3 changes to this file. |
| `src/app/(public)/review/[token]/page.tsx` | 2 | Public, token-gated Server Component — hero + invalid/expired fallback state. |
| `src/app/(public)/review/[token]/ReviewReveal.tsx` | 2 | Client Component — the expandable "Project details" card (description, View Project link, Download Resources). |
| `src/app/admin/projects/ReviewLinkPanel.tsx` | 3 | Client Component — the admin modal to generate/view/copy a project's review link. |

## 3. Modified files

| File | Stage | Change |
|---|---|---|
| `prisma/schema.prisma` | 1 | `Project` model gains `projectLink`, `pdfFiles`, `reviewToken`, `tokenExpiresAt`. No other model touched. |
| `src/app/admin/projects/ProjectsManagement.tsx` | 3 | Imports `ReviewLinkPanel`; adds one `reviewLinkFor` state value; adds a fourth row action, "Review link"; renders the panel conditionally. No existing column, action, or the Project Editor drawer was changed. |

**Not modified, and deliberately so:** `src/lib/mock-data.ts` (the
`Project` UI type), `src/lib/db-mappers.ts`, `src/components/data/DataTable.tsx`,
`src/app/(public)/client-review/*` (the existing §9 feedback page),
`src/lib/actions/projects.ts`, and every file outside this phase's scope.
See §6.2 for why `mock-data.ts`/`db-mappers.ts` didn't need to change.

---

## 4. Data flow

### 4.1 Generate (admin)

```
Admin → Projects Management → row action "Review link"
      → ReviewLinkPanel opens → getReviewLink(slug) checks for an
        existing, still-active token
      → "Generate review link" (or "Regenerate") → generateReviewLink(slug)
      → crypto.randomBytes(32) token, now + 7 days expiry
      → prisma.project.update({ where: { slug }, data: { reviewToken, tokenExpiresAt } })
      → panel shows the full URL, "Copy" button, and the expiry date/time
```

Regenerating silently overwrites the previous token (confirmed
intentional in this phase's earlier turn) — the panel does not ask for
confirmation before regenerating, only states afterward, in the UI copy,
that the old link stops working.

### 4.2 Validate (client / public)

```
Anyone with the link → /review/{token}
                      → validateReviewToken(token)
                      → prisma.project.findUnique({ where: { reviewToken: token } })
                      → null / expired → friendly "link no longer available" state
                      → valid → hero (title) + ReviewReveal (description,
                        projectLink, pdfFiles)
```

---

## 5. File & page count audit — "strict technical planning limits"

| Metric | Before Phase 9.3.11 | After Phase 9.3.11 | Budget (Page_Structure.md) |
|---|---|---|---|
| Public routes (`(public)/**/page.tsx`) | 9 | **10** | 9 named pages (PART A §1–9) |
| — of which match a named PART A page 1:1 | 9 | 9 | 9 |
| — new, not a named PART A page | 0 | **1** (`/review/[token]`) | n/a — this is the Decision-Record-002-approved token-link route, not a new marketing/content page |
| Admin routes (`admin/**/page.tsx`) | 7 | 7 (unchanged) | 7 (PART B §10–16) |
| **Total route `page.tsx` files** | 16 | **17** | 16 + 1 explicitly approved exception |
| Prisma models | 3 | **3 (unchanged)** | 3 (`Project`, `Testimonial`, `Message` — hard limit per both Decision Records) |
| `Project` model fields | 17 | **21** (+`projectLink`, `pdfFiles`, `reviewToken`, `tokenExpiresAt`) | no field-count limit specified; only a model-count limit |
| `src/lib/actions/*.ts` files | 5 (`auth`, `owner`, `projects`, `messages`, `testimonials`) | **6** (+`review.ts`) | no stated limit |
| Total `.ts`/`.tsx` files under `src/` | 60 | **64** (+`review.ts`, +2 review-page files, +`ReviewLinkPanel.tsx`) | no stated limit |

**Read on the one over-budget number (public routes: 9 → 10):** the 9-page
public IA in Page_Structure PART A is unchanged — every one of the 9
named pages still exists exactly as specified, `/client-review` (§9)
included. The 10th route is additive, not a substitute, and is exactly
the feature Decision Record 002 pre-approved the concept of and this
phase was explicitly scoped to build. If "16 total pages" is meant as a
hard ceiling rather than a floor, that would need its own explicit
decision to lift — flagged here rather than silently absorbed into the
count.

**Every other limit in both Decision Records holds exactly:** 3 Prisma
models, no `User`/`Client`/`Settings` model, no role/permission system, no
client accounts or login.

---

## 6. Deviations from the initially-approved Stage 1 design

Two adjustments were made to `src/lib/actions/review.ts` beyond what was
approved in the Stage 1 exchange. Both are additive/corrective, not
behavior changes to what was already approved.

### 6.1 `generateReviewLink(projectId)` → `generateReviewLink(slug)`

**Why:** the admin-facing `Project` UI type
(`src/lib/mock-data.ts`) has no `id` field — only `slug` — and it's the
type `ProjectsManagement.tsx` and `DataTable` operate on. Every other
Project-mutating Server Action in this codebase (`updateProject`,
`deleteProject` in `src/lib/actions/projects.ts`) already identifies a
project by `slug`, not a Prisma row `id`, for the same reason. Wiring
Stage 3 against the originally-approved `projectId` signature would have
required adding an `id` field to `Project` (`mock-data.ts`) and its
Prisma-row mapper (`db-mappers.ts`) — two more files touched, for one
field, purely to carry an identifier the rest of the Projects feature
doesn't use. Renaming the parameter to `slug` (and the Prisma call to
`where: { slug }`) matches the existing convention instead. **No
behavior changed** — token generation, expiry, and the silent-overwrite
behavior are byte-identical to what was approved; only the lookup key
changed.

### 6.2 Added `getReviewLink(slug)`

**Why:** Stage 3's brief asked for an admin UI to "generate, **view**,
and easily copy" a project's link. Stage 1 only defined `generateReviewLink`
(write) and `validateReviewToken` (public read, by token). Without a
read path keyed by `slug`, the admin panel would have had to call
`generateReviewLink` — which **overwrites** the existing token — every
time an admin simply wanted to re-open the panel and copy an
already-issued link, silently invalidating any link already sent to a
client. `getReviewLink` is a pure read (no mutation), admin-gated the
same way as `generateReviewLink`, and is what makes "view" in the Stage
3 brief actually mean *view* rather than *implicitly regenerate*.

---

## 7. Accessibility & design-system checklist

| Check | Result |
|---|---|
| Single `<h1>` per page | ✅ `/review/[token]` — project title (valid state) or the fallback heading (invalid state); never both |
| Landmarks | ✅ `<main role="main">`, existing `TopNavBar`/`Footer` landmarks reused unchanged |
| 44px touch targets | ✅ reveal trigger, View Project link, each PDF download card, Copy button, panel close button, Generate/Regenerate buttons |
| Visible focus | ✅ `focus-visible:outline` on every new interactive element, consistent with the existing `Button`/`Input` tokens |
| Keyboard operability | ✅ reveal trigger is a real `<button>` with `aria-expanded`/`aria-controls`; modal close is reachable and labeled; no click-only affordance |
| Status not color-only | ✅ "Copied to clipboard" and error states are text (`role="status"`/`role="alert"`), not color-coded alone |
| Empty states informative, not blank | ✅ "No active review link for this project yet.", "No resources have been shared for this project yet." |
| `prefers-reduced-motion` respected | ✅ `ReviewReveal`'s framer-motion transition drops to `duration: 0` via `useReducedMotion()` |
| RTL / logical properties | ✅ `text-start`, `me-*`; no new hardcoded `left`/`right`; icons used are direction-neutral (link, chevron, document, copy) so none needs an RTL mirror rule |
| No color outside the approved palette | ✅ only `--primary`/`--foreground`/`--surface`/`--border` tokens used; the one `text-destructive` class from an earlier draft was corrected to the same neutral-ink convention `DataTable`'s existing destructive action already uses (this project defines no dedicated error/danger color token) |
| Private route not indexed | ✅ `/review/[token]` sets `robots: { index: false, follow: false }` |

---

## 8. Remaining limitations

- **No real build/typecheck was run** (no network access in this
  environment, consistent with every prior phase). Run `npm install &&
  npx prisma generate && npm run lint && npm run build` before shipping.
  In particular, confirm the Prisma-generated `Project` type (with the
  four new fields) matches what `review.ts` and `db-mappers.ts` expect —
  hand-checked against the schema text, not against generated types.
- **No migration was run in this environment.** You mentioned the schema
  has already been pushed to your database directly; if that was via
  `prisma db push` rather than `prisma migrate dev`, there is still no
  committed migration file in `prisma/migrations/` recording this
  change — worth reconciling before the next teammate runs `migrate dev`
  and gets a diff against an un-migrated database.
- **Client Review's "submit feedback" write-back is not built.**
  Decision Record 002's full concept ends in "Client submits feedback";
  Stages 1–3 only cover "admin generates a link → client can view it."
  The existing `/client-review` static form (§9) is unrelated (it's not
  wired to a token or a specific project). If per-project feedback
  submission is wanted, it needs its own explicitly scoped stage — it
  would likely touch the `Testimonial` model (already approved) rather
  than requiring a new one.
- **No expiry-warning or link-management list.** An admin currently has
  to open each project's panel individually to see whether its link is
  still active; there's no "all active review links" overview. Not
  requested; flagged as a natural Stage 4 candidate if useful.
- **`pdfFiles` has no upload UI.** The schema field and the review
  page's rendering of it both exist, but nothing in Projects Management
  lets an admin populate `pdfFiles` (or `projectLink`) yet — those
  presumably need to be added to the existing Project Editor drawer in a
  future stage; today they'd have to be set directly in the database.
- **10th public route, not 9** — see §5's read on this. Flagged
  explicitly rather than silently absorbed, since the brief for this
  report specifically asked for page-count tracking against "strict
  technical planning limits."

---

## Final Validation

| Check | Result |
|---|---|
| Schema changes limited to `Project` model, no new models | ✅ |
| `generateReviewLink`, `validateReviewToken`, `getReviewLink` implemented | ✅ |
| Silent-overwrite regeneration behavior preserved exactly | ✅ |
| Public review page fetches via `validateReviewToken`, renders hero + interactive reveal | ✅ |
| Interactive reveal shows description, View Project link, Download Resources | ✅ |
| Admin UI to generate/view/copy a review link, attached to Projects Management | ✅ |
| No redesign of existing Login/Setup/Dashboard/component library | ✅ |
| No OAuth, client accounts, RBAC, or new database models | ✅ |
| Accessibility (44px targets, focus, landmarks, reduced motion, RTL) | ✅ — see §7 |
| File/page counts tracked against Page_Structure budget | ✅ — see §5; one flagged, explained exception (10th public route) |
| Real build/lint/typecheck executed | ⚠️ not run — environment has no network access, see §8 |

---

Final Status:
PASS (implementation) — with the build-verification and migration-reconciliation caveats in §8 outstanding.
