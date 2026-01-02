import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import "./data-grid.css";

export type Align = "left" | "center" | "right";

export interface Column<T> {
  key: string;
  header: string;
  width?: "sm" | "md" | "lg" | "xl";
  align?: Align;
  render: (row: T) => ReactNode;
}

export interface RowAction<T> {
  key: string;
  label: string;
  onAction: (row: T) => void;
  isDanger?: boolean;
  isDisabled?: (row: T) => boolean;
}

export interface DataGridProps<T> {
  ariaLabel: string;
  columns: Array<Column<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  actions?: Array<RowAction<T>>;
  emptyTitle?: string;
  emptyBody?: string;
}

export function DataGrid<T>({ ariaLabel, columns, rows, getRowKey, onRowClick, actions, emptyTitle = "No items", emptyBody = "There is nothing to show." }: DataGridProps<T>) {
  const hasActions = Boolean(actions && actions.length > 0);

  if (rows.length === 0) {
    return (
      <div className="rbm-empty" role="status" aria-label="Empty state">
        <div className="rbm-empty__title">{emptyTitle}</div>
        <div className="rbm-empty__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <div className="rbm-grid" role="region" aria-label={ariaLabel}>
      <table className="rbm-grid__table">
        <thead className="rbm-grid__thead">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cx("rbm-grid__th", c.width && `rbm-grid__w--${c.width}`, c.align && `rbm-grid__a--${c.align}`)}>
                {c.header}
              </th>
            ))}
            {hasActions ? <th className="rbm-grid__th rbm-grid__th--actions">Actions</th> : null}
          </tr>
        </thead>

        <tbody className="rbm-grid__tbody">
          {rows.map((row) => {
            const rk = getRowKey(row);
            const clickable = Boolean(onRowClick);

            return (
              <tr key={rk} className={cx("rbm-grid__tr", clickable && "rbm-grid__tr--clickable")} onClick={() => onRowClick?.(row)}>
                {columns.map((c) => (
                  <td key={`${rk}-${c.key}`} className={cx("rbm-grid__td", c.align && `rbm-grid__a--${c.align}`)}>
                    {c.render(row)}
                  </td>
                ))}

                {hasActions ? (
                  <td className="rbm-grid__td rbm-grid__td--actions">
                    <div className="rbm-grid__actions">
                      {actions!.map((a) => {
                        const disabled = a.isDisabled ? a.isDisabled(row) : false;
                        return (
                          <button
                            key={a.key}
                            type="button"
                            className={cx("rbm-grid__action", "rbm-focus", a.isDanger && "rbm-grid__action--danger")}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!disabled) a.onAction(row);
                            }}
                            disabled={disabled}
                            aria-label={a.label}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
