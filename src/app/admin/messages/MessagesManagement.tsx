"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { MonoChip } from "@/components/content/MonoChip";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/lib/mock-data";
import { deleteMessage } from "@/lib/actions/messages";
import { useTranslation } from "@/i18n/client";

type MessagesManagementProps = {
  messages: Message[];
};

export function MessagesManagement({ messages }: MessagesManagementProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [viewing, setViewing] = useState<Message | null>(null);
  const [sent, setSent] = useState(false);

  const columns = useMemo<DataTableColumn<Message>[]>(
    () => [
      {
        key: "name",
        header: t.messagesCMS.fromCol,
        sortable: true,
        sortValue: (m) => m.name,
        render: (m) => (
          <div>
            <p className="font-medium text-foreground">{m.name}</p>
            <p className="text-xs text-foreground/60">{m.email}</p>
          </div>
        ),
      },
      {
        key: "subject",
        header: t.messagesCMS.subjectCol,
        sortable: true,
        sortValue: (m) => m.subject,
        render: (m) => m.subject,
      },
      {
        key: "service",
        header: t.messagesCMS.serviceCol,
        sortable: true,
        sortValue: (m) => m.service,
        render: (m) => <MonoChip>{m.service}</MonoChip>,
      },
      {
        key: "status",
        header: t.messagesCMS.statusCol,
        sortable: true,
        sortValue: (m) => m.status,
        render: (m) => {
          let statusLabel: string = m.status;
          if (m.status === "New") statusLabel = t.messagesCMS.statusNew;
          else if (m.status === "Read") statusLabel = t.messagesCMS.statusRead;
          else if (m.status === "Replied") statusLabel = t.messagesCMS.statusReplied;
          return (
            <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${m.status === "New" ? "bg-primary" : "bg-foreground/40"}`}
              />
              {statusLabel}
            </span>
          );
        },
      },
      {
        key: "receivedAt",
        header: t.messagesCMS.receivedCol,
        sortable: true,
        align: "end",
        sortValue: (m) => m.receivedAt,
        render: (m) => <span className="numeral-ltr text-foreground/70">{m.receivedAt}</span>,
      },
    ],
    [t],
  );

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
        caption={t.messagesCMS.allMessages}
        columns={columns}
        rows={messages}
        getRowId={(m) => m.id}
        getRowLabel={(m) => `${t.messagesCMS.fromCol}: ${m.name}`}
        rowActions={[
          { label: t.messagesCMS.viewAction, onSelect: openMessage },
          { label: t.messagesCMS.deleteAction, onSelect: handleDelete, destructive: true },
        ]}
      />

      {viewing ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label={t.messagesCMS.closeMessageAria}
            onClick={() => setViewing(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${t.messagesCMS.fromCol}: ${viewing.name}`}
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
                aria-label={t.messagesCMS.closeMessageAria}
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
              <h3 className="font-sans text-sm font-semibold text-foreground">{t.messagesCMS.sendReplyHeading}</h3>

              {sent ? (
                <p role="status" className="mt-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm text-foreground">
                  {t.messagesCMS.replySubmittedNotice}
                </p>
              ) : (
                <form onSubmit={handleReply} className="mt-3 flex flex-col gap-4" noValidate>
                  <Textarea
                    id="reply-message"
                    label={t.messagesCMS.replyLabel}
                    placeholder={t.messagesCMS.replyPlaceholder.replace("{name}", viewing.name.split(" ")[0])}
                    required
                  />
                  <Button type="submit" className="self-start">
                    {t.messagesCMS.sendReplyBtn}
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
