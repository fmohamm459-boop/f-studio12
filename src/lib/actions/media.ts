"use server";

import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

// File & Media Management — Server Action (Phase 9.3.12).
//
// This action issues a short-lived, SIGNED set of upload parameters; it
// never receives or forwards a file itself. The browser then uploads the
// file directly to Cloudinary's API using those parameters (see
// src/app/admin/projects/PdfUploadZone.tsx). This matters concretely for
// this project: it's deployed on Vercel's Hobby tier, whose serverless
// functions cap request-body size well below what a high-res image or a
// multi-page PDF can reach. Proxying the file through a Server Action or
// Route Handler here would risk failing on exactly the files this feature
// exists to handle. Signing keeps the upload secure (nothing is uploaded
// with a forgeable/guessable credential — the signature is only valid for
// the exact params it was computed for, and expires with `timestamp`)
// without ever routing the binary through this server.
//
// Currently used for PDF uploads only (Project.pdfFiles — see the Stage 3
// wiring in src/lib/actions/projects.ts and the phase report's "Stopped"
// section for why image/logo/identity uploads are not wired up yet).
// `folder` is a parameter, not hardcoded to the PDF path, so this same
// action can back an image-upload zone later without changes here.

const DEFAULT_PDF_FOLDER = "f-studio/projects/pdfs";

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export async function getUploadSignature(
  folder: string = DEFAULT_PDF_FOLDER,
): Promise<UploadSignature> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated.");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Only params actually sent with the upload may be included here — the
  // client must send this exact param set back (see PdfUploadZone.tsx),
  // or Cloudinary rejects the signature.
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return { signature, timestamp, apiKey, cloudName, folder };
}
