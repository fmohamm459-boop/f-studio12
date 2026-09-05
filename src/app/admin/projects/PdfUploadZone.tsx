"use client";

import { useId, useRef, useState } from "react";
import { getUploadSignature } from "@/lib/actions/media";
import { useTranslation } from "@/i18n/client";

type UploadZoneProps = {
  label: string;
  helpText: string;
  accept: string;
  acceptLabel: string;
  multiple: boolean;
  maxFiles?: number;
  folder: string;
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

function fileLabel(url: string, acceptLabel: string, fallbackSuffix: string): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    // Not a parseable absolute URL — fall through.
  }
  return `${acceptLabel} ${fallbackSuffix}`;
}

/** True if `file`'s MIME type satisfies an <input accept> string ("application/pdf" or a wildcard like "image/*"). */
function matchesAccept(file: File, accept: string): boolean {
  if (accept.endsWith("/*")) {
    return file.type.startsWith(accept.slice(0, -1));
  }
  return file.type === accept;
}

/** Uploads one file directly to Cloudinary using a server-issued signature. */
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
  const { t } = useTranslation();
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    for (const file of files) {
      if (!matchesAccept(file, accept)) {
        setState({
          status: "error",
          message: t.uploadZone.invalidFileType
            .replace("{fileName}", file.name)
            .replace("{acceptLabel}", acceptLabel.toLowerCase()),
        });
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setState({
          status: "error",
          message: t.uploadZone.fileOverLimit.replace("{fileName}", file.name),
        });
        continue;
      }

      setState({ status: "uploading", fileName: file.name, progress: 0 });
      try {
        const signature = await getUploadSignature(folder);
        const url = await uploadToCloudinary(file, signature, (progress) =>
          setState({ status: "uploading", fileName: file.name, progress }),
        );
        onChange(maxFiles === 1 ? [url] : [...value, url]);
        setState({ status: "success" });
      } catch {
        setState({
          status: "error",
          message: t.uploadZone.uploadFailed.replace("{fileName}", file.name),
        });
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
    ? t.uploadZone.uploadingFile
        .replace("{fileName}", state.fileName)
        .replace("{progress}", String(state.progress))
    : atCapacity
      ? t.uploadZone.replacePrompt.replace("{acceptLabel}", acceptLabel.toLowerCase())
      : t.uploadZone.uploadPrompt;

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
        {state.status === "success" ? t.uploadZone.uploadComplete : ""}
      </p>
      <p role="alert" className="mt-1 min-h-[1.25rem] text-xs text-foreground">
        {state.status === "error" ? state.message : ""}
      </p>

      {value.length > 0 && previewKind === "icon" ? (
        <ul className="mt-3 flex flex-col gap-2">
          {value.map((url) => {
            const name = fileLabel(url, acceptLabel, t.uploadZone.fileFallback);
            return (
              <li
                key={url}
                className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-2"
              >
                <DocumentIcon className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  aria-label={t.uploadZone.removeFileAria.replace("{label}", name)}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-foreground/60 hover:bg-background hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {value.length > 0 && previewKind === "thumbnail" ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url) => (
            <li
              key={url}
              className="group relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label={t.uploadZone.removeImageAria}
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
