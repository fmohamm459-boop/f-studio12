"use client";

import { useId, useRef, useState } from "react";
import { getUploadSignature } from "@/lib/actions/media";

// Upload Zone (Phase 9.3.12 Stage 1: PDF-only; generalized in Stage 2 to
// also back Hero Image and Gallery Images). This remains the single
// upload component in the project — Stage 2's brief was explicit about
// reusing it rather than adding a second one, so every upload surface in
// the Project Editor (PDFs, hero image, gallery) renders through this
// same file. File kept at its Stage 1 path/name; only the exported
// component was generalized (from `PdfUploadZone` to `UploadZone`) and
// its behavior parameterized via props — the upload mechanics
// (getUploadSignature → signed direct-to-Cloudinary XHR upload) are
// unchanged from Stage 1.

type UploadZoneProps = {
  /** Field label shown above the drop zone. */
  label: string;
  /** One line of help text under the label. */
  helpText: string;
  /** Native <input accept>. Use a MIME wildcard like "image/*" for images. */
  accept: string;
  /** Noun used in validation messages, e.g. "PDF" or "image". */
  acceptLabel: string;
  /** Whether the native file picker allows selecting more than one file at once. */
  multiple: boolean;
  /**
   * 1 = single-file "replace" mode (Hero Image): uploading a new file
   * replaces whatever is already there. Omitted/undefined = unlimited
   * (PDFs, Gallery Images): uploads append, preserving order.
   */
  maxFiles?: number;
  /** Cloudinary folder passed through to getUploadSignature — unchanged
   * signing mechanism from Stage 1, just a different destination folder
   * per field. */
  folder: string;
  /** How already-uploaded files render: a document-icon list row (PDFs)
   * or an image thumbnail tile (Hero/Gallery). */
  previewKind: "icon" | "thumbnail";
  value: string[];
  onChange: (files: string[]) => void;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string; progress: number }
  | { status: "error"; message: string }
  | { status: "success" };

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB — Cloudinary's free-tier per-file ceiling

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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 13V4M10 4 6.5 7.5M10 4l3.5 3.5M4.5 14.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5V13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function fileLabel(url: string, acceptLabel: string): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    // Not a parseable absolute URL — fall through.
  }
  return `${acceptLabel} file`;
}

/** True if `file`'s MIME type satisfies an <input accept> string ("application/pdf" or a wildcard like "image/*"). */
function matchesAccept(file: File, accept: string): boolean {
  if (accept.endsWith("/*")) {
    return file.type.startsWith(accept.slice(0, -1));
  }
  return file.type === accept;
}

/** Uploads one file directly to Cloudinary using a server-issued signature. Unchanged from Stage 1. */
function uploadToCloudinary(
  file: File,
  signature: Awaited<ReturnType<typeof getUploadSignature>>,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url?: string };
          if (data.secure_url) {
            resolve(data.secure_url);
            return;
          }
        } catch {
          // fall through to reject below
        }
        reject(new Error("Cloudinary returned an unexpected response."));
      } else {
        reject(new Error("Cloudinary rejected the upload."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

/**
 * Generic upload zone for the Project Editor. Uploads directly to
 * Cloudinary via a signed request (src/lib/actions/media.ts) and reports
 * resulting `secure_url`s back to the parent form via `onChange` —
 * persistence to the database happens when the Project Editor's own
 * "Save changes" is submitted, the same as every other field in that
 * form (an upload only ever updates local draft state on its own).
 *
 * "Remove" only drops a URL from this list (and, once saved, from the
 * corresponding database field) — it does not delete the underlying
 * Cloudinary asset. See the phase report's "Remaining limitations".
 */
export function UploadZone({
  label,
  helpText,
  accept,
  acceptLabel,
  multiple,
  maxFiles,
  folder,
  previewKind,
  value,
  onChange,
}: UploadZoneProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    for (const file of files) {
      if (!matchesAccept(file, accept)) {
        setState({ status: "error", message: `"${file.name}" isn't a valid ${acceptLabel.toLowerCase()}.` });
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setState({ status: "error", message: `"${file.name}" is over the 10MB limit.` });
        continue;
      }

      setState({ status: "uploading", fileName: file.name, progress: 0 });
      try {
        const signature = await getUploadSignature(folder);
        const url = await uploadToCloudinary(file, signature, (progress) =>
          setState({ status: "uploading", fileName: file.name, progress }),
        );
        // maxFiles === 1 is "replace" mode (Hero Image): the new upload
        // takes the single slot rather than appending. Otherwise, append
        // and preserve the existing order (PDFs, Gallery Images).
        onChange(maxFiles === 1 ? [url] : [...value, url]);
        setState({ status: "success" });
      } catch {
        setState({ status: "error", message: `Couldn't upload "${file.name}". Please try again.` });
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(url: string) {
    onChange(value.filter((existing) => existing !== url));
  }

  const isUploading = state.status === "uploading";
  const atCapacity = maxFiles !== undefined && value.length >= maxFiles;
  const promptText = isUploading
    ? `Uploading ${state.fileName}… ${state.progress}%`
    : atCapacity
      ? `Click to replace, or drag and drop a new ${acceptLabel.toLowerCase()}`
      : `Click to upload, or drag and drop`;

  return (
    <div>
      <label className="text-sm font-medium text-foreground" htmlFor={inputId}>
        {label}
      </label>
      <p className="mt-1 text-sm text-foreground/60">{helpText}</p>

      <div className="mt-3">
        <label
          htmlFor={inputId}
          className={`flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-4 py-6 text-sm text-foreground/70 transition-colors duration-150 hover:bg-background ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <UploadIcon className="shrink-0" />
          {promptText}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={isUploading}
          onChange={(event) => handleFiles(event.target.files)}
          className="sr-only"
        />
      </div>

      <p role="status" className="mt-2 min-h-[1.25rem] text-xs text-primary">
        {state.status === "success" ? "Upload complete." : ""}
      </p>
      <p role="alert" className="mt-1 min-h-[1.25rem] text-xs text-foreground">
        {state.status === "error" ? state.message : ""}
      </p>

      {value.length > 0 && previewKind === "icon" ? (
        <ul className="mt-3 flex flex-col gap-2">
          {value.map((url) => (
            <li
              key={url}
              className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-2"
            >
              <DocumentIcon className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{fileLabel(url, acceptLabel)}</span>
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label={`Remove ${fileLabel(url, acceptLabel)}`}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-foreground/60 hover:bg-background hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {value.length > 0 && previewKind === "thumbnail" ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url) => (
            <li
              key={url}
              className="group relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- next/image requires
                  a remotePatterns entry for res.cloudinary.com in next.config.ts, which is
                  out of scope for this phase (see the phase report). */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label="Remove image"
                className="absolute end-1.5 top-1.5 flex min-h-[32px] min-w-[32px] items-center justify-center rounded-[var(--radius-lg)] bg-ink/60 text-paper opacity-0 transition-opacity duration-150 hover:bg-ink/80 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group-hover:opacity-100"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
