import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { cx } from "../utils/cx";
import { uid } from "../utils/id";
import "./tabs.css";

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  isDisabled?: boolean;
}

export interface TabsProps {
  label: string;
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ label, items, activeKey, onChange, className }: TabsProps) {
  const tablistId = useMemo(() => uid("rbm-tabs"), []);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = Math.max(0, items.findIndex((t) => t.key === activeKey));
  const activeItem = items[activeIndex] ?? items[0];

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, items.length);
  }, [items.length]);

  const focusTab = (idx: number) => {
    tabRefs.current[idx]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const enabled = items.map((t, i) => ({ t, i })).filter(({ t }) => !t.isDisabled).map(({ i }) => i);
    if (enabled.length === 0) return;
    const currentPos = enabled.indexOf(activeIndex);

    let nextIndex = activeIndex;
    if (e.key === "Home") nextIndex = enabled[0]!;
    if (e.key === "End") nextIndex = enabled[enabled.length - 1]!;
    if (e.key === "ArrowLeft") nextIndex = enabled[Math.max(0, currentPos - 1)]!;
    if (e.key === "ArrowRight") nextIndex = enabled[Math.min(enabled.length - 1, currentPos + 1)]!;

    const nextKey = items[nextIndex]?.key;
    if (nextKey && !items[nextIndex]?.isDisabled) {
      onChange(nextKey);
      focusTab(nextIndex);
    }
  };

  return (
    <div className={cx("rbm-tabs", className)}>
      <div className="rbm-tabs__list" role="tablist" aria-label={label} id={tablistId} onKeyDown={onKeyDown}>
        {items.map((t, idx) => {
          const isActive = t.key === activeKey;
          const tabId = `${tablistId}-tab-${t.key}`;
          const panelId = `${tablistId}-panel-${t.key}`;

          return (
            <button
              key={t.key}
              ref={(el) => { tabRefs.current[idx] = el; }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={Boolean(t.isDisabled)}
              className={cx("rbm-tab", "rbm-focus", isActive && "rbm-tab--active")}
              onClick={() => { if (!t.isDisabled) onChange(t.key); }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        className="rbm-tabs__panel"
        role="tabpanel"
        id={`${tablistId}-panel-${activeItem.key}`}
        aria-labelledby={`${tablistId}-tab-${activeItem.key}`}
      >
        {activeItem.content}
      </div>
    </div>
  );
}
