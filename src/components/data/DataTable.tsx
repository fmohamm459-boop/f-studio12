"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/i18n/client";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "start" | "end";
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
};

export type DataTableRowAction<T> = {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean;
};

type DataTableProps<T> = {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  rowActions?: DataTableRowAction<T>[];
  selectable?: boolean;
  emptyMessage?: string;
};

type SortState = { key: string; direction: "asc" | "desc" } | null;

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  getRowLabel,
  rowActions,
  selectable = false,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t.dataTable.noResults;
  const [sort, setSort] = useState<SortState>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const withValues = rows.map((row) => ({ row, value: column.sortValue!(row) }));
    withValues.sort((a, b) => {
      const cmp =
        typeof a.value === "number" && typeof b.value === "number"
          ? a.value - b.value
          : String(a.value).localeCompare(String(b.value));
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return withValues.map((w) => w.row);
  }, [rows, sort, columns]);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === sortedRows.length ? new Set() : new Set(sortedRows.map(getRowId))));
  }

  const allSelected = selectable && sortedRows.length > 0 && selected.size === sortedRows.length;
  const someSelected = selectable && selected.size > 0 && !allSelected;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated">
      {selectable ? (
        <p role="status" className="border-b border-border px-4 py-2.5 text-xs text-foreground/60">
          <span className="numeral-ltr">{selected.size}</span> {t.dataTable.selectedCount}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border">
              {selectable ? (
                <th
                  scope="col"
                  className="sticky start-0 z-10 w-11 bg-surface-elevated p-3 text-start"
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    aria-label={t.dataTable.selectAllRows}
                    className="h-[18px] w-[18px] rounded-[4px] border-border align-middle accent-primary"
                  />
                </th>
              ) : null}
              {columns.map((column, index) => {
                const isFirst = index === 0 && !selectable;
                const isSorted = sort?.key === column.key;
                const ariaSort = column.sortable
                  ? isSorted
                    ? sort!.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                  : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort as React.AriaAttributes["aria-sort"]}
                    className={`${isFirst ? "sticky start-0 z-10 bg-surface-elevated" : ""} p-3 font-mono text-xs uppercase tracking-wide text-foreground/60 ${
                      column.align === "end" ? "text-end" : "text-start"
                    }`}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="flex min-h-[44px] items-center gap-1 font-mono text-xs uppercase tracking-wide text-foreground/60 hover:text-foreground"
                      >
                        {column.header}
                        <svg
                          aria-hidden="true"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          className={
                            isSorted && sort!.direction === "desc" ? "rotate-180" : undefined
                          }
                        >
                          <path d="M2 3.5 5 1l3 2.5M2 6.5 5 9l3-2.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        </svg>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              {rowActions && rowActions.length > 0 ? (
                <th scope="col" className="p-3 text-end font-mono text-xs uppercase tracking-wide text-foreground/60">
                  {t.dataTable.actionsCol}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="p-8 text-center text-sm text-foreground/60"
                >
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => {
                const id = getRowId(row);
                const isPendingDelete = pendingDeleteId === id;
                return (
                  <tr key={id} className="border-b border-border last:border-b-0">
                    {selectable ? (
                      <td className="sticky start-0 z-10 w-11 bg-surface-elevated p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleRow(id)}
                          aria-label={t.dataTable.selectRow.replace("{label}", getRowLabel(row))}
                          className="h-[18px] w-[18px] rounded-[4px] border-border align-middle accent-primary"
                        />
                      </td>
                    ) : null}
                    {columns.map((column, index) => {
                      const isFirst = index === 0 && !selectable;
                      return (
                        <td
                          key={column.key}
                          className={`${isFirst ? "sticky start-0 z-10 bg-surface-elevated" : ""} p-3 text-sm text-foreground ${
                            column.align === "end" ? "text-end" : "text-start"
                          }`}
                        >
                          {column.render(row)}
                        </td>
                      );
                    })}
                    {rowActions && rowActions.length > 0 ? (
                      <td className="p-3 text-end">
                        {isPendingDelete ? (
                          <div role="status" className="flex items-center justify-end gap-2">
                            <span className="text-xs text-foreground/70">
                              {t.dataTable.deletePrompt.replace("{label}", getRowLabel(row))}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const action = rowActions.find((a) => a.destructive);
                                action?.onSelect(row);
                                setPendingDeleteId(null);
                              }}
                              className="min-h-[44px] rounded-[var(--radius-lg)] bg-primary px-3 text-xs font-medium text-primary-foreground"
                            >
                              {t.dataTable.confirm}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="min-h-[44px] rounded-[var(--radius-lg)] border border-border px-3 text-xs font-medium text-foreground/80"
                            >
                              {t.dataTable.cancel}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {rowActions.map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                onClick={() =>
                                  action.destructive ? setPendingDeleteId(id) : action.onSelect(row)
                                }
                                aria-label={`${action.label} ${getRowLabel(row)}`}
                                className={`flex min-h-[44px] items-center rounded-[var(--radius-lg)] px-2.5 text-xs font-medium transition-colors duration-150 ${
                                  action.destructive
                                    ? "text-foreground/70 hover:bg-surface hover:text-foreground"
                                    : "text-foreground/70 hover:bg-surface hover:text-foreground"
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
