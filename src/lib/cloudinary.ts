import { v2 as cloudinary } from "cloudinary";

// Cloudinary SDK configuration (Phase 9.3.12, "File & Media Management").
// Server-only — this file must never be imported from a Client Component
// (it isn't; only src/lib/actions/media.ts imports it). Used solely to
// compute upload *signatures* here; the file bytes themselves are never
// sent to or through this server — see src/lib/actions/media.ts for why.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
