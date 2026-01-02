import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import { TextInput } from "../primitives/TextInput";
import "./filter-bar.css";

export interface FilterChip { key: string; label: string; onRemove: () => void; }

export interface FilterBarProps {
  searchLabel?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  chips?: FilterChip[];
  right?: ReactNode;
  className?: string;
}

export function FilterBar({ searchLabel = "Search", searchValue, onSearchChange, chips = [], right, className }: FilterBarProps) {
  return (
    <div className={cx("rbm-filter", className)} role="region" aria-label="Filters">
      <div className="rbm-filter__left">
        <div className="rbm-filter__search">
          <TextInput
            label={searchLabel}
            value={searchValue}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            placeholder="Search…"
          />
        </div>

        {chips.length > 0 ? (
          <ul className="rbm-filter__chips" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key} className="rbm-chip">
                <span className="rbm-chip__label">{c.label}</span>
                <button
                  type="button"
                  className={cx("rbm-chip__remove", "rbm-focus")}
                  onClick={c.onRemove}
                  aria-label={`Remove filter: ${c.label}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {right ? <div className="rbm-filter__right">{right}</div> : null}
    </div>
  );
}
