"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { MonoChip } from "@/components/content/MonoChip";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/lib/mock-data";
import { deleteMessage } from "@/lib/actions/messages";

type MessagesManagementProps = {
  messages: Message[];
};

const columns: DataTableColumn<Message>[] = [
  {
    key: "name",
    header: "From",
    sortable: true,
    sortValue: (m) => m.name,
    render: (m) => (
      <div>
        <p className="font-medium text-foreground">{m.name}</p>
        <p className="text-xs text-foreground/60">{m.email}</p>
      </div>
    ),
  },
  { key: "subject", header: "Subject", sortable: true, sortValue: (m) => m.subject, render: (m) => m.subject },
  { key: "service", header: "Service", sortable: true, sortValue: (m) => m.service, render: (m) => <MonoChip>{m.service}</MonoChip> },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortValue: (m) => m.status,
    render: (m) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
        <span
          aria-hidden="true"
          className={`inline-block h-1.5 w-1.5 rounded-full ${m.status === "New" ? "bg-primary" : "bg-foreground/40"}`}
        />
        {m.status}
      </span>
    ),
  },
  {
    key: "receivedAt",
    header: "Received",
    sortable: true,
    align: "end",
    sortValue: (m) => m.receivedAt,
    render: (m) => <span className="numeral-ltr text-foreground/70">{m.receivedAt}</span>,
  },
];

/**
 * Messages Management (Page_Structure.md §14). The Message List is the
 * DataTable below; selecting "View" opens the Detail View drawer with a
 * reading pane and a "Send Reply" form. "Delete" calls the real
 * deleteMessage Server Action (src/lib/actions/messages.ts); router.refresh()
 * re-reads the database afterward. Per this phase's approved CRUD scope,
 * Message only supports Read + Delete — the reply form still only shows a
 * local confirmation, since sending/persisting a reply would be an
 * additional (unapproved) operation.
 */
export function MessagesManagement({ messages }: MessagesManagementProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [viewing, setViewing] = useState<Message | null>(null);
  const [sent, setSent] = useState(false);

  function openMessage(message: Message) {
    setSent(false);
    setViewing(message);
  }

  function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  function handleDelete(message: Message) {
    startTransition(async () => {
      if (viewing?.id === message.id) setViewing(null);
      await deleteMessage(message.id);
      router.refresh();
    });
  }

  return (
    <>
      <DataTable
        caption="Inbound messages"
        columns={columns}
        rows={messages}
        getRowId={(m) => m.id}
        getRowLabel={(m) => `message from ${m.name}`}
        rowActions={[
          { label: "View", onSelect: openMessage },
          { label: "Delete", onSelect: handleDelete, destructive: true },
        ]}
      />

      {viewing ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close message"
            onClick={() => setViewing(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Message from ${viewing.name}`}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-s border-border bg-surface-elevated p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-sans text-xl font-semibold text-foreground">{viewing.subject}</h2>
                <p className="mt-1 text-sm text-foreground/70">
                  {viewing.name} &middot; {viewing.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label="Close message"
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-foreground/70 hover:bg-surface hover:text-foreground"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <MonoChip>{viewing.service}</MonoChip>
              <span className="numeral-ltr font-mono text-xs text-foreground/50">{viewing.receivedAt}</span>
            </div>

            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{viewing.message}</p>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-sans text-sm font-semibold text-foreground">Send reply</h3>

              {sent ? (
                <p role="status" className="mt-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm text-foreground">
                  Reply preview submitted — no message was actually sent (no API route at this stage).
                </p>
              ) : (
                <form onSubmit={handleReply} className="mt-3 flex flex-col gap-4" noValidate>
                  <Textarea
                    id="reply-message"
                    label="Reply"
                    placeholder={`Hi ${viewing.name.split(" ")[0]}, thanks for reaching out...`}
                    required
                  />
                  <Button type="submit" className="self-start">
                    Send reply
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
