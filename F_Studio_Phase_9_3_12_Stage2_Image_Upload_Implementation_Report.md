# F Studio — Phase 9.3.12 Stage 2 Image Upload Implementation Report
## Schema Approval & Complete Image Upload Implementation

**Scope:** Implements the officially-approved `heroImage`/`galleryImages`
fields on the existing `Project` model and wires Hero Image + Gallery
Images upload into the Project Editor, continuing strictly from the
uploaded Phase 9.3.12 Stage 1 project (PDF upload — locked, unmodified in
its upload mechanics).

---

## 1. Created files

**None.** Per the brief's explicit "Do NOT create new reusable upload
components" / "Files allowed to modify" list, Stage 2 required no new
files — Hero Image and Gallery Images both reuse the same upload
component and Server Action Stage 1 already created.

## 2. Modified files

| File | Change |
|---|---|
| `prisma/schema.prisma` | `Project` model gains exactly the two approved fields: `heroImage String?` and `galleryImages String[] @default([])`. Nothing else in the schema changed. |
| `src/lib/mock-data.ts` | `Project` UI type gains `heroImage?: string` and `galleryImages?: string[]` (both optional — no existing mock entry needed updating). |
| `src/lib/db-mappers.ts` | `toUiProject` now maps `heroImage: row.heroImage ?? undefined` and `galleryImages: row.galleryImages`. |
| `src/lib/actions/projects.ts` | `ProjectInput` gains `heroImage?: string \| null` (nullable, so "Remove image" can explicitly clear a saved value — not just leave it undefined/unchanged) and `galleryImages?: string[]`. Both `createProject` and `updateProject` now write them. |
| `src/app/admin/projects/PdfUploadZone.tsx` | **Generalized**, not replaced — see §5. Same file, same path, still the one and only upload component in the project. Its exported component is now `UploadZone` (parameterized by label/help text/accept/multiple/maxFiles/folder/previewKind) instead of the PDF-specific `PdfUploadZone`; the actual upload mechanics (`getUploadSignature` call, signed `XMLHttpRequest` POST to Cloudinary, progress/error/success state machine) are **byte-for-byte unchanged** from Stage 1. |
| `src/app/admin/projects/ProjectsManagement.tsx` | Adds `heroImageDraft`/`galleryImagesDraft` state (initialized from `project.heroImage`/`project.galleryImages` when the editor opens); replaces the inert decorative `aspect-video` placeholder `<div>` (present since Phase 9.3.7, never backed by real data) with a real `<UploadZone>` for Hero Image; adds a second `<UploadZone>` for Gallery Images directly below it; includes `heroImage: heroImageDraft[0] ?? null` and `galleryImages: galleryImagesDraft` in the `updateProject` call on submit. The existing PDF `UploadZone` call site was updated to pass its config explicitly (see §5) but its behavior is unchanged. No other field, the drawer's structure, or any layout/spacing/token was touched. |

**Not modified** (confirmed by diff against the original Phase 9.3.10-A
upload): `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
`src/lib/owner-store.ts`, `src/lib/actions/auth.ts`,
`src/lib/actions/owner.ts`, `package.json`, `src/lib/cloudinary.ts`,
`src/lib/actions/media.ts` (the signing action needed no changes — see
§4), every public page, the Settings/Dashboard/Messages/Testimonials
pages, and the shared component library (`src/components/ui/*`,
`src/components/data/*`, etc.).

---

## 3. Schema changes

```prisma
model Project {
  // ...unchanged fields...

  // --- File & Media Management (Phase 9.3.12 Stage 2) ---
  // Cloudinary secure_url values only (Task 6) — no public_id, asset_id,
  // version, or other Cloudinary metadata is stored. `heroImage` is a
  // single, replaceable image; `galleryImages` preserves upload order
  // (append-only from the admin UI, same array-of-URL shape `pdfFiles`
  // already established above).
  heroImage     String?
  galleryImages String[] @default([])
}
```

Exactly the two fields approved — no third field, no relation, no new
model. Placed as their own clearly-commented block, separate from the
Phase 9.3.11 "Client Review System" block directly above it in the file
(which was left untouched), so the two phases' schema history stays
readable independently.

---

## 4. Cloudinary integration

**Unchanged from Stage 1**, reused as instructed:

- `src/lib/cloudinary.ts` — SDK config from env vars. Not touched.
- `src/lib/actions/media.ts` — `getUploadSignature(folder?)` Server
  Action. Not touched. It already took `folder` as a parameter in Stage
  1 (so a future second upload zone could use a different Cloudinary
  folder without changing this file) — Stage 2 simply calls it with two
  new folder values (`f-studio/projects/hero`,
  `f-studio/projects/gallery`) alongside the existing
  `f-studio/projects/pdfs`. No new Cloudinary upload endpoint, resource
  type, or auth flow was introduced; every upload — PDF, hero, or
  gallery — still POSTs to the same `.../auto/upload` endpoint using the
  same signed-parameter scheme.
- **Task 6 compliance:** only `secure_url` is ever read from Cloudinary's
  upload response and stored (see `uploadToCloudinary` in
  `PdfUploadZone.tsx` — it destructures just `data.secure_url`). No
  `public_id`, `asset_id`, `version`, or other response field is
  persisted anywhere.

---

## 5. Why one component, not three — how `UploadZone` was reused

Stage 1's `PdfUploadZone` was PDF-specific: hardcoded `accept`,
hardcoded "PDF resources" copy, a document-icon file list, and an
unconditional-append upload behavior. Task 3's "Reuse the existing Upload
Zone... Do NOT create another uploader" meant this component itself
needed to become the shared surface for three fields, not that three new
components should each partially copy it.

**What changed inside the file:** the exported component is now
`UploadZone`, taking `label`, `helpText`, `accept`, `acceptLabel`,
`multiple`, `maxFiles`, `folder`, and `previewKind` as props instead of
having them hardcoded. Everything else — the `getUploadSignature` call,
the signed `XMLHttpRequest` upload, the progress percentage tracking, the
`role="status"`/`role="alert"` feedback lines, the 44px targets, the
`--radius-lg`/`--border`/`--surface`/`--primary` tokens — is identical
code to Stage 1, just no longer parameterless.

**Two new behaviors, both additive:**
- `previewKind: "thumbnail"` — renders a grid of image tiles
  (`aspect-video`, `object-cover`, existing border/radius tokens) instead
  of the PDF path's icon-and-filename list, with a small hover/focus
  "remove" button overlaid in the corner. Uses a plain `<img>` tag, not
  `next/image` — see §7 for why.
- `maxFiles={1}` — "replace" mode. When the Hero Image zone already holds
  one image and a new file is uploaded, `onChange` is called with just
  the new URL (`[url]`), not an appended array — satisfying Task 4's
  "Replace existing image" without a separate code path. The drop-zone
  prompt text also changes from "Click to upload…" to "Click to
  replace…" once a hero image is present, so the affordance is
  discoverable rather than only working invisibly.

The PDF call site in `ProjectsManagement.tsx` was updated to pass its
configuration explicitly (`accept="application/pdf"`,
`folder="f-studio/projects/pdfs"`, `previewKind="icon"`, no `maxFiles`)
— matching exactly what was previously hardcoded inside the component, so
its behavior is unchanged.

---

## 6. Upload workflows

### 6.1 Shared mechanics (all three fields)

```
Admin selects file(s) in a zone
  → client validates: MIME matches `accept`, size ≤ 10MB
  → getUploadSignature(folder)  [Server Action, unchanged from Stage 1]
      → auth() check
      → cloudinary.utils.api_sign_request({ timestamp, folder }, API_SECRET)
  → browser XHR POST directly to
      https://api.cloudinary.com/v1_1/{cloudName}/auto/upload
      — xhr.upload.onprogress drives the visible "Uploading… N%" state
  → response.secure_url → onChange(...) updates the field's draft state
  → (nothing is written to the database yet)
  → admin clicks the form's existing "Save changes"
  → updateProject(slug, { ...otherFields, heroImage, galleryImages, pdfFiles })
  → prisma.project.update(...)
  → router.refresh()
```

### 6.2 Hero Image workflow (Task 4)

| Requirement | How it's met |
|---|---|
| Single image | `maxFiles={1}`; the field's draft state is a 1-element array internally, flattened to `heroImageDraft[0] ?? null` on submit |
| Replace existing image | Uploading while one is already present calls `onChange([url])`, discarding the old URL from draft state (see §5) |
| Preview before save | The thumbnail grid renders `heroImageDraft` immediately after upload succeeds, before "Save changes" is ever clicked |
| Remove image | The tile's remove button calls `onChange([])`; on save, `heroImage: null` clears the field in the database |
| Loading state | Drop-zone label shows "Uploading `{filename}`… `{percent}`%", input disabled during upload |
| Upload progress | `xhr.upload.onprogress` → live percentage in the loading label |
| Error handling | `role="alert"` line: wrong type, over 10MB, or a Cloudinary/network failure, each with a specific message |
| Success feedback | `role="status"` line: "Upload complete." |

### 6.3 Gallery Images workflow (Task 5)

| Requirement | How it's met |
|---|---|
| Multiple images | `multiple`, no `maxFiles` — unlimited, native file picker allows multi-select |
| Add images | Each successful upload appends via `onChange([...value, url])` |
| Remove images | Each tile's remove button filters that one URL out of the array |
| Image previews | Same thumbnail grid as Hero Image (`previewKind="thumbnail"`), 2/3-column responsive grid |
| Preserve upload order | Appending (never re-sorting) keeps `galleryImagesDraft` — and therefore `Project.galleryImages` — in upload order |
| Loading / progress / error / success | Identical mechanics to §6.2 (shared component) |

---

## 7. Data layer & Prisma mapping changes

- **Type flow:** `Project.heroImage`/`galleryImages` (Prisma, nullable
  string / string array) → `toUiProject` in `db-mappers.ts` (nullable
  coalesced to `undefined` for `heroImage`, matching how `liveLink` is
  already handled in that same function) → `Project` UI type in
  `mock-data.ts` (optional fields) → `ProjectInput` in
  `actions/projects.ts` (accepts `string | null` for `heroImage` so
  "clear it" is expressible, plain `string[]` for `galleryImages`) →
  `updateProject`'s conditional spread (`...(input.heroImage !==
  undefined && { heroImage: input.heroImage })`) so omitting the field
  from an update leaves the stored value untouched, while explicitly
  passing `null` clears it.
- **Backward compatibility:** every new field is optional at every layer
  (`?:` in both UI types, `@default([])`/nullable in Prisma). Existing
  `Project` rows created before this phase — and the static
  `PROJECTS` mock array in `mock-data.ts` — need no migration/update;
  they simply read as `heroImage: undefined, galleryImages: []`.
- **`next/image` not used for previews.** Rendering Cloudinary-hosted
  thumbnails with `next/image` would need a `remotePatterns` entry for
  `res.cloudinary.com` in `next.config.ts` — a file not on this phase's
  "allowed to modify" list. `PdfUploadZone.tsx`'s thumbnail preview uses
  a plain `<img>` tag instead (see the inline comment/eslint-disable in
  that file). This is scoped to the admin editor's live preview only; it
  doesn't affect how (or whether) these images might be rendered
  elsewhere later.

---

## 8. Build verification

**Deferred, as instructed.** The previous phase (Stage 1) already
confirmed this sandbox cannot reach `registry.npmjs.org` (`npm install`
failed with `403 Forbidden`). Per this phase's explicit instruction, none
of `npm install`, `npx prisma generate`, `npm run lint`, or `npm run
build` were executed this turn, and no speculative fix was attempted.

Before shipping: run `npm install && npx prisma generate && npm run lint
&& npm run build` in an environment with registry access. In particular,
confirm the regenerated `PrismaClient` types include `heroImage`/
`galleryImages` on `Project` (they should, by inspection of the schema
diff — no other model or field was touched), and that
`ProjectsManagement.tsx`'s new `UploadZone` prop usage type-checks
cleanly against the updated `PdfUploadZone.tsx`.

---

## 9. Remaining limitations

- **Build/lint/typecheck genuinely not run this turn** — deferred per
  explicit instruction, see §8.
- **"Remove" doesn't delete from Cloudinary** for hero/gallery images,
  same as PDFs in Stage 1 — only the URL is dropped from the database
  field; the asset stays in your Cloudinary account. Still flagged rather
  than silently accepted; still out of scope without a decision on
  whether to additionally store each asset's `public_id` (which Task 6
  explicitly says not to do "unless explicitly required" — read here as
  "not yet required").
- **No client-side image compression/resizing before upload.** A very
  large but under-10MB image (e.g. an uncompressed 9MB PNG) uploads at
  full size; Cloudinary can transform on delivery, but nothing in this
  phase requests a transformation URL — `secure_url` is stored as-is,
  per Task 6.
- **No drag-and-drop event handling was added** — the drop zone's copy
  says "or drag and drop," inherited from Stage 1's PDF zone copy, but
  the underlying `<input type="file">` only responds to a click-triggered
  file picker in both stages; no `onDrop`/`onDragOver` handlers exist.
  This was already true in Stage 1 and wasn't introduced or fixed this
  phase — flagged for visibility since Hero/Gallery now share the same
  copy and therefore the same gap.
- **Gallery has no manual reordering** (drag-to-reorder, move up/down) —
  only append and remove. "Preserve upload order" (Task 5) is satisfied
  as upload order, not as an editable order.
- **No per-project storage/quota visibility** — same limitation noted in
  the Stage 1 report, still applicable.
- **No admin "Create new project" entry point** — same pre-existing gap
  noted in the Stage 1 report (`createProject` still updated for
  consistency, still unused by the UI). Unrelated to this phase; not
  fixed here.

---

## Final Validation

| Check | Result |
|---|---|
| Exactly `heroImage`, `galleryImages` added to `Project`; no other schema change | ✅ |
| No new Prisma models | ✅ still exactly 3 |
| No new pages | ✅ 17 route `page.tsx` files, unchanged from Stage 1 |
| Data layer updated with full backward compatibility (optional fields throughout) | ✅ §7 |
| Existing Upload Zone reused; no second/third uploader component created | ✅ same file (`PdfUploadZone.tsx`), same export path, generalized — see §5 |
| `getUploadSignature` reused unmodified | ✅ `src/lib/actions/media.ts` untouched |
| Hero Image: single, replace, preview, remove, loading/progress/error/success | ✅ §6.2 |
| Gallery Images: multiple, add/remove, previews, order preserved, loading/progress/error/success | ✅ §6.3 |
| Only `secure_url` persisted (no `public_id`/`asset_id`/`version`/metadata) | ✅ §4 |
| Design system unchanged (typography, spacing, colors, cards, forms, layout, animations, tokens) | ✅ new UI reuses only existing tokens/components; no new component library entries |
| Authentication, owner store, public pages, dashboard, settings, middleware, `package.json` untouched | ✅ confirmed by cumulative diff |
| Build/lint/typecheck executed | ⏭️ deferred, as explicitly instructed — see §8 |

---

Final Status:

**Implementation: PASS.** All six tasks delivered exactly within the
approved schema change and the "files allowed to modify" list.
**Verification: DEFERRED** — per explicit instruction, no install/build
commands were run in this environment; this is not claimed as a passing
build.
