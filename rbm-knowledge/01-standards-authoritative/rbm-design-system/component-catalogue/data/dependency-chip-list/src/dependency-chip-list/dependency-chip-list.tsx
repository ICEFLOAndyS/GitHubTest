import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { cx } from "../utils/cx";
import { ConfirmDialog } from "../feedback/ConfirmDialog";
import "./dependency-chip-list.css";

export type DependencyKind = "FS" | "SS" | "FF" | "SF";

export interface DependencyChip {
  id: string;
  label: string;
  kind: DependencyKind;
  meta?: string;
  right?: ReactNode;
}

export interface DependencyChipListProps {
  title?: string;
  chips: DependencyChip[];
  canRemove?: boolean;
  onRemove?: (id: string) => Promise<void> | void;
  className?: string;
}

export function DependencyChipList({ title = "Dependencies", chips, canRemove = false, onRemove, className }: DependencyChipListProps) {
  const [pending, setPending] = useState<DependencyChip | null>(null);

  const body = useMemo(() => {
    if (!pending) return null;
    return (
      <div className="rbm-dcl__confirmBody">
        <div className="rbm-dcl__confirmLine">
          Remove dependency: <span className="rbm-dcl__confirmStrong">{pending.label}</span>
        </div>
        <div className="rbm-dcl__confirmHint">This may change execution sequencing.</div>
      </div>
    );
  }, [pending]);

  const confirmRemove = async () => {
    if (!pending) return;
    await onRemove?.(pending.id);
    setPending(null);
  };

  return (
    <section className={cx("rbm-dcl", className)} aria-label={title}>
      <header className="rbm-dcl__header">
        <h3 className="rbm-dcl__title">{title}</h3>
      </header>

      {chips.length === 0 ? (
        <div className="rbm-dcl__empty">No dependencies.</div>
      ) : (
        <ul className="rbm-dcl__list" aria-label="Dependency list">
          {chips.map((c) => (
            <li key={c.id} className="rbm-dcl__item">
              <span className={cx("rbm-dcl__chip", `rbm-dcl__chip--${c.kind}`)}>
                <span className="rbm-dcl__kind" aria-label={`Dependency type ${c.kind}`}>{c.kind}</span>
                <span className="rbm-dcl__label">{c.label}</span>
                {c.meta ? <span className="rbm-dcl__meta">{c.meta}</span> : null}
              </span>

              {c.right ? <span className="rbm-dcl__right">{c.right}</span> : null}

              {canRemove ? (
                <button
                  type="button"
                  className={cx("rbm-dcl__remove", "rbm-focus")}
                  onClick={() => setPending(c)}
                  aria-label={`Remove dependency ${c.label}`}
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(pending)}
        title="Remove dependency?"
        intent="danger"
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setPending(null)}
        body={body ?? <div />}
      />
    </section>
  );
}
