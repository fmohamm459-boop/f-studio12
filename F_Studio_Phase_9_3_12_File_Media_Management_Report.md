# F Studio — Phase 9.3.12 File & Media Management Report

**Scope:** Cloudinary-based file upload for the admin Project Editor,
continuing strictly from the uploaded Phase 9.3.11 project. Per this
phase's explicit instruction — *"If the current schema does not already
support the required file fields, stop and report instead of modifying
the schema without explicit approval"* — this phase's work is split into
what was implemented and what was stopped. See §1.

---

## 1. What was implemented vs. stopped — read this first

| Requested upload target | Schema support | Result |
|---|---|---|
| **PDF files** (`Project.pdfFiles`) | ✅ Already exists — `pdfFiles String[] @default([])`, added in Phase 9.3.11 | **Implemented fully** — signed direct-to-Cloudinary upload, wired into the Project Editor, persisted to the database. |
| **Project images** | ❌ No field exists | **Stopped.** No schema field currently holds a project image URL. |
| **Logos** | ❌ No field exists | **Stopped.** Same reason. |
| **Identity assets** | ❌ No field exists | **Stopped.** Same reason. |

The Project model has exactly one file/media field today: `pdfFiles`. The
decorative image placeholder already visible at the top of the Project
Editor form (`aspect-video ... bg-surface`, present since Phase 9.3.7) is
just that — decorative; it has never been backed by a real field, and
still isn't. Per this phase's explicit instruction, **no schema change
was made** to add one.

**Proposed fields, for your explicit approval before any Stage 2 of this
phase:**

```prisma
heroImage      String?              // primary project image (Portfolio card + Project Details hero)
galleryImages  String[] @default([]) // logos, identity assets, application mockups
```

These would live on `Project`, the same model `pdfFiles`/`reviewToken`/
`projectLink` already extended in Phase 9.3.11 — no new model, so this
stays within the 3-model limit either way. Naming, cardinality (one hero
image vs. a gallery vs. separate `logoImage`/`identityImages` fields), and
which existing pages would start reading them are all open questions I
did not decide unilaterally — flagging them here rather than guessing.

Everything below this point describes what **was** built (the PDF path)
and the infrastructure that's now in place to add images/logos once the
schema question above is resolved — the signing mechanism itself is
generic and doesn't need to change to support a second upload zone.

---

## 2. Setup instructions

### 2.1 Cloudinary account

1. Create a free Cloudinary account (the free tier covers this use case —
   25 credits/month, which is generous for admin-uploaded PDFs at
   typical case-study volume).
2. From the Cloudinary Dashboard, copy: **Cloud name**, **API Key**, **API
   Secret**.

### 2.2 Environment variables

Added to `.env.example`:

```bash
CLOUDINARY_CLOUD_NAME="replace-with-your-cloud-name"
CLOUDINARY_API_KEY="replace-with-your-api-key"
CLOUDINARY_API_SECRET="replace-with-your-api-secret"
```

All three are **server-only** — none are prefixed `NEXT_PUBLIC_`, and none
are sent to the browser. The client learns the cloud name from the signed
response `getUploadSignature` returns, not from its own copy of the
variable. Set these in Vercel's Project Settings → Environment Variables
for each environment (Production/Preview/Development) before deploying.

### 2.3 Package installation

One dependency added to `package.json`:

```json
"cloudinary": "^2.5.0"
```

This is Cloudinary's official Node SDK, used **only** to compute the
upload signature server-side (`cloudinary.utils.api_sign_request`, called
from `src/lib/actions/media.ts`). No client-side Cloudinary package
(`next-cloudinary`, the browser upload widget, etc.) was added — the
browser talks to Cloudinary's plain REST upload endpoint directly via
`XMLHttpRequest`, which needs no SDK. Run `npm install` to pull this in
(this could not be executed in this sandbox — see §7).

### 2.4 Why signed **direct-to-Cloudinary** upload, not a proxy

Task 2 asked for "secure upload handling ... compatible with the existing
App Router architecture," and your context specified deployment on
**Vercel's Hobby tier**. That combination drove the architecture:

- A Server Action or Route Handler that receives the file itself (as
  `FormData`) and re-uploads it to Cloudinary from the server would route
  every file through a Vercel serverless function — which has a request
  body-size ceiling well below what a high-res image or a multi-page PDF
  can reach on the Hobby tier.
- Instead, `getUploadSignature` (`src/lib/actions/media.ts`) is a tiny
  Server Action that returns only a signature + a handful of short
  strings — never the file. The browser then uploads directly to
  `https://api.cloudinary.com/v1_1/{cloud}/auto/upload` using that
  signature. The file bytes never pass through this Next.js deployment at
  all.
- It's still secure: the signature is computed server-side with the
  secret `CLOUDINARY_API_SECRET` (never exposed to the browser), is only
  valid for the exact parameters it was signed for, and the action itself
  checks `auth()` first — an unauthenticated request gets `"Not
  authenticated."` and no signature.

No `next.config.ts` change was needed for this — file size limits on
Server Actions (`experimental.serverActions.bodySizeLimit`) are
irrelevant here since no file passes through one.

---

## 3. Created files

| File | Purpose |
|---|---|
| `src/lib/cloudinary.ts` | Configures the Cloudinary SDK from the three env vars above. Server-only. |
| `src/lib/actions/media.ts` | `getUploadSignature(folder?)` Server Action — admin-gated (`auth()`), returns a signed, short-lived parameter set for a direct browser→Cloudinary upload. Generic (`folder` is a parameter, defaulting to the PDF folder), so it can back an image-upload zone later without changes to this file. |
| `src/app/admin/projects/PdfUploadZone.tsx` | Client Component — the "PDF resources" upload zone in the Project Editor. Client-side type/size validation (PDF only, ≤10MB), calls `getUploadSignature`, uploads via `XMLHttpRequest` (for real progress reporting — `fetch` has no upload-progress API), shows loading/error/success states, and lets the admin remove an uploaded file from the list before saving. |

## 4. Modified files

| File | Change |
|---|---|
| `src/lib/mock-data.ts` | `Project` type gains `pdfFiles?: string[]` (optional, so the existing mock array needs no per-entry update). |
| `src/lib/db-mappers.ts` | `toUiProject` now maps `pdfFiles: row.pdfFiles` — this field has existed in the Prisma schema since Phase 9.3.11, but was never read into the general `Project` UI shape before (Phase 9.3.11 only queried it directly, via a narrow `select`, for the public review page). |
| `src/lib/actions/projects.ts` | `ProjectInput` gains `pdfFiles?: string[]`; both `createProject` and `updateProject` now write it to the database. |
| `src/app/admin/projects/ProjectsManagement.tsx` | Adds a `pdfFilesDraft` state value, initialized from `project.pdfFiles` when the editor opens; renders `<PdfUploadZone>` inside the existing form (after the "Solution" field, before the Save/Cancel buttons — no other field, layout, or the drawer's structure changed); includes `pdfFiles: pdfFilesDraft` in the `updateProject` call on submit. |
| `.env.example` | Adds the three Cloudinary variables (§2.2). |
| `package.json` | Adds the `cloudinary` dependency (§2.3). |

**Not modified:** `prisma/schema.prisma` (per §1 — the one file this
phase's brief explicitly said not to touch without approval),
`next.config.ts`, the component library, any page file, and every file
outside this list. The cumulative diff against the original Phase
9.3.10-A upload confirms this phase touched exactly the 8 files above (3
created, 5 modified) on top of the prior phases' already-approved
changes.

---

## 5. Upload flow

```
Admin opens Project Editor → PdfUploadZone
  → selects PDF(s) (client validates: type === application/pdf, size ≤ 10MB)
  → getUploadSignature() [Server Action]
      → auth() check — throws if no session
      → cloudinary.utils.api_sign_request({ timestamp, folder }, API_SECRET)
      → returns { signature, timestamp, apiKey, cloudName, folder }  (no file, no secret)
  → browser XHR POST directly to
      https://api.cloudinary.com/v1_1/{cloudName}/auto/upload
      (file, api_key, timestamp, signature, folder)
      — progress bar driven by xhr.upload.onprogress
  → response.secure_url appended to local `pdfFilesDraft` state
  → (admin can "Remove" a file from the draft list before saving —
     removes the URL from the array; does NOT delete the Cloudinary asset)
  → admin clicks "Save changes" (the form's existing submit)
  → updateProject(slug, { ...otherFields, pdfFiles: pdfFilesDraft })
  → prisma.project.update({ where: { slug }, data: { pdfFiles } })
  → router.refresh()
```

Uploading and saving are deliberately two separate steps, matching how
every other field in this form already works (type into a text field →
click "Save changes" once) — an upload populates the draft list and shows
its own success state immediately, but nothing is written to the
database until the surrounding form is submitted.

---

## 6. Loading, error, and success states

All within the existing design tokens (`--radius-lg`, `--border`,
`--surface`, `--primary`, existing type scale) — no new colors, no new
component patterns beyond what `ReviewLinkPanel`/`ReviewReveal` (Phase
9.3.11) already established for this codebase.

| State | UI |
|---|---|
| Idle | Dashed-border drop zone, "Click to upload PDF files, or drag and drop" |
| Uploading | Zone shows "Uploading `{filename}`… `{percent}`%", disabled during upload, `aria-disabled` via the native `disabled` attribute on the file input |
| Success | `role="status"` line reads "File uploaded." (auto-clears on the next action, doesn't linger) |
| Error (bad type, over size limit, network/Cloudinary failure) | `role="alert"` line with a specific message (e.g. `"resume.docx" isn't a PDF.`, `"case-study.pdf" is over the 10MB limit.`) |
| Uploaded file list | Each file: document icon, best-effort filename derived from the URL, a labeled 44px "Remove" button |

---

## 7. Build verification

Per the mandatory verification sequence:

### Step 1 — `npm install`

**Command:** `npm install`
**Result:** **FAIL**

```
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@prisma%2fclient
npm error 403 In most cases, you or one of your dependencies are requesting
npm error 403 a package version that is forbidden by your security policy, or
npm error 403 on a server you do not have access to.
npm error A complete log of this run can be found in: /home/claude/.npm/_logs/2026-07-26T12_00_40_762Z-debug-0.log
```

**Root cause:** Environment issue — this sandbox has no outbound network
access (identical failure mode to Phase 9.3.10-B's build attempt; every
dependency in `package.json`, not just the newly-added `cloudinary`,
returns the same `403` from `registry.npmjs.org`). Not a dependency issue
with `cloudinary` specifically, and not a source-code issue — no project
file is read before `npm install` itself fails at dependency resolution.

### Steps 2–4 — `npx prisma generate`, `npm run lint`, `npm run build`

**Not executed.** Per this phase's explicit instruction — *"If any
command fails: Stop immediately... Do not attempt speculative fixes"* —
no further command was run. Each of these depends on a populated
`node_modules` (Prisma's generator, ESLint's Next config, and the Next.js
compiler are all installed dependencies, absent from this repository
without a successful install).

**This report does not claim success.** The ZIP has been generated (see
Deliverables), but verification did not complete. Please run `npm
install && npx prisma generate && npm run lint && npm run build` in an
environment with registry access before shipping. In particular:
`npm run lint`/`npm run build` should be treated as unverified for the
new `cloudinary` import and the `XMLHttpRequest`-based upload code (typed
by hand against Cloudinary's documented SDK/API, not against installed
types), and `npx prisma generate` should confirm the `Project` Prisma
type still matches what `db-mappers.ts` and `projects.ts` expect (it
does, by inspection — no schema change was made this phase).

---

## 8. Remaining limitations

- **Build/lint/typecheck could not be run** — see §7.
- **Images, logos, and identity assets are not implemented** — see §1.
  This is the largest remaining gap against the phase's stated objective
  ("uploading project images, logos, identity files, **and** PDF
  files") and needs your explicit schema decision before it can proceed.
- **"Remove" doesn't delete from Cloudinary.** Removing a file from the
  draft list (or saving without it) only removes the URL from
  `Project.pdfFiles` — the underlying asset stays in your Cloudinary
  account. A `destroy`-based cleanup action would need the asset's
  `public_id` (not just its `secure_url`) to be practical, which isn't
  currently stored anywhere. Flagged rather than built silently, since
  adding it means deciding whether to store `public_id` alongside each
  URL (would change `pdfFiles` from `String[]` to something structured,
  e.g. `Json`) — another schema-shape decision, not made unilaterally.
- **No per-project storage/quota visibility.** Nothing in this phase
  surfaces how much of Cloudinary's free tier has been used; not
  requested, flagged as a natural follow-up given the "generous free
  tier" framing in your brief.
- **No admin "Create new project" entry point exists in the UI** (this
  predates this phase — `createProject` has existed as a Server Action
  since Phase 9.3.9/9.3.11 but nothing in `ProjectsManagement.tsx` calls
  it; only "Edit" is wired to a row). `createProject` was still updated
  to accept `pdfFiles` for consistency, but there's currently no form
  that would exercise that path. Unrelated to file/media management;
  noted rather than fixed, since building a Create flow would be UI
  scope beyond this phase's brief.
- **Sequential, not parallel, multi-file upload.** Selecting several PDFs
  at once uploads them one at a time (simpler progress UI, and avoids N
  concurrent signature requests). For typical case-study-PDF volumes
  this is a minor UX cost, not a functional limitation.

---

## Final Validation

| Check | Result |
|---|---|
| Schema modified without approval | ✅ **did not happen** — `prisma/schema.prisma` untouched this phase (confirmed by diff) |
| Stopped and reported where schema doesn't support requested fields (images/logos/identity) | ✅ see §1 |
| PDF upload implemented end-to-end (signed direct upload → admin UI → saved to DB) | ✅ |
| Only required package installed | ✅ `cloudinary` only |
| No new Prisma models | ✅ still exactly 3 |
| No new pages | ✅ 17 route `page.tsx` files, same as before this phase (the 17th being `/review/[token]` from Phase 9.3.11) |
| No UI/layout/component-library redesign | ✅ new upload zone reuses existing tokens; no existing field, column, or drawer structure changed |
| No OAuth, no authentication changes | ✅ `getUploadSignature` reuses the existing `auth()` check pattern already established in `review.ts`; nothing in the auth system itself was touched |
| Previous phases not broken | ✅ cumulative diff against the original upload shows only additive changes on top of Phases 9.3.10-B/9.3.11's already-approved work |
| `npm install` | ❌ FAIL — environment issue (no registry access in this sandbox), see §7 |
| `npx prisma generate` / `npm run lint` / `npm run build` | ⏭️ not run — blocked by `npm install` failure, per explicit "stop immediately" instruction |

---

Final Status:

**FAIL (verification)** — `npm install` could not complete in this
environment; no further build steps were attempted, per instruction. The
PDF upload path is complete and scoped exactly to what the current schema
supports; the image/logo/identity-asset portion of this phase was
deliberately **not** implemented, pending your explicit approval of the
schema fields proposed in §1.
