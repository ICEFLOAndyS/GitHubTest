import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import "./selectable-data-grid.css";

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

export interface SelectableDataGridProps<T> {
  ariaLabel: string;
  columns: Array<Column<T>>;
  rows: T[];
  getRowKey: (row: T) => string;

  selectedKeys: string[];
  onSelectedKeysChange: (keys: string[]) => void;

  isRowSelectable?: (row: T) => boolean;
  onRowClick?: (row: T) => void;
  actions?: Array<RowAction<T>>;

  emptyTitle?: string;
  emptyBody?: string;
}

function uniq(xs: string[]): string[] {
  return Array.from(new Set(xs));
}

export function SelectableDataGrid<T>({
  ariaLabel,
  columns,
  rows,
  getRowKey,
  selectedKeys,
  onSelectedKeysChange,
  isRowSelectable,
  onRowClick,
  actions,
  emptyTitle = "No items",
  emptyBody = "There is nothing to show.",
}: SelectableDataGridProps<T>) {
  const isSelectable = (row: T) => (isRowSelectable ? isRowSelectable(row) : true);

  const selectableRowKeys = rows.filter(isSelectable).map(getRowKey);
  const selectedSet = new Set(selectedKeys);

  const selectedSelectableCount = selectableRowKeys.filter((k) => selectedSet.has(k)).length;
  const allSelected = selectableRowKeys.length > 0 && selectedSelectableCount === selectableRowKeys.length;
  const someSelected = selectedSelectableCount > 0 && !allSelected;

  const hasActions = Boolean(actions && actions.length > 0);

  const toggleAll = () => {
    if (allSelected) {
      const remaining = selectedKeys.filter((k) => !selectableRowKeys.includes(k));
      onSelectedKeysChange(remaining);
    } else {
      onSelectedKeysChange(uniq([...selectedKeys, ...selectableRowKeys]));
    }
  };

  const toggleOne = (key: string) => {
    if (selectedSet.has(key)) {
      onSelectedKeysChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectedKeysChange([...selectedKeys, key]);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rbm-empty" role="status" aria-label="Empty state">
        <div className="rbm-empty__title">{emptyTitle}</div>
        <div className="rbm-empty__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <div className="rbm-sgrid" role="region" aria-label={ariaLabel}>
      <table className="rbm-sgrid__table">
        <thead className="rbm-sgrid__thead">
          <tr>
            <th className="rbm-sgrid__th rbm-sgrid__th--sel">
              <input
                type="checkbox"
                className="rbm-sgrid__cb"
                aria-label="Select all rows"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleAll}
              />
            </th>

            {columns.map((c) => (
              <th
                key={c.key}
                className={cx("rbm-sgrid__th", c.width && `rbm-sgrid__w--${c.width}`, c.align && `rbm-sgrid__a--${c.align}`)}
              >
                {c.header}
              </th>
            ))}

            {hasActions ? <th className="rbm-sgrid__th rbm-sgrid__th--actions">Actions</th> : null}
          </tr>
        </thead>

        <tbody className="rbm-sgrid__tbody">
          {rows.map((row) => {
            const rk = getRowKey(row);
            const selectable = isSelectable(row);
            const checked = selectedSet.has(rk);
            const clickable = Boolean(onRowClick);

            return (
              <tr
                key={rk}
                className={cx(
                  "rbm-sgrid__tr",
                  clickable && "rbm-sgrid__tr--clickable",
                  checked && "rbm-sgrid__tr--selected",
                  !selectable && "rbm-sgrid__tr--locked",
                )}
                onClick={() => onRowClick?.(row)}
              >
                <td className="rbm-sgrid__td rbm-sgrid__td--sel">
                  <input
                    type="checkbox"
                    className="rbm-sgrid__cb"
                    aria-label={`Select row ${rk}`}
                    disabled={!selectable}
                    checked={checked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleOne(rk)}
                  />
                </td>

                {columns.map((c) => (
                  <td key={`${rk}-${c.key}`} className={cx("rbm-sgrid__td", c.align && `rbm-sgrid__a--${c.align}`)}>
                    {c.render(row)}
                  </td>
                ))}

                {hasActions ? (
                  <td className="rbm-sgrid__td rbm-sgrid__td--actions">
                    <div className="rbm-sgrid__actions">
                      {actions!.map((a) => {
                        const disabled = a.isDisabled ? a.isDisabled(row) : false;
                        return (
                          <button
                            key={a.key}
                            type="button"
                            className={cx("rbm-sgrid__action", "rbm-focus", a.isDanger && "rbm-sgrid__action--danger")}
                            disabled={disabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!disabled) a.onAction(row);
                            }}
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
