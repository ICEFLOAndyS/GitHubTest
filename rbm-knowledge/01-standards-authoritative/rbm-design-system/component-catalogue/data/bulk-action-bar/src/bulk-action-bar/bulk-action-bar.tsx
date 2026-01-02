import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import { Button } from "../primitives/Button";
import "./bulk-action-bar.css";

export interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: Array<{
    key: string;
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    isDisabled?: boolean;
  }>;
  leftHint?: ReactNode;
  className?: string;
}

export function BulkActionBar({ selectedCount, onClearSelection, actions, leftHint, className }: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div className={cx("rbm-bab", className)} role="region" aria-label="Bulk actions">
      <div className="rbm-bab__left">
        <div className="rbm-bab__count">{selectedCount} selected</div>
        {leftHint ? <div className="rbm-bab__hint">{leftHint}</div> : null}
      </div>

      <div className="rbm-bab__right">
        <Button variant="ghost" onClick={onClearSelection}>Clear</Button>
        <div className="rbm-bab__actions" role="group" aria-label="Bulk action buttons">
          {actions.map((a) => (
            <Button key={a.key} variant={a.variant ?? "secondary"} disabled={Boolean(a.isDisabled)} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
