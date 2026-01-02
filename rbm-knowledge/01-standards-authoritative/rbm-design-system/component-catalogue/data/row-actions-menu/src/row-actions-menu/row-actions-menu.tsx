import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "../utils/cx";
import { uid } from "../utils/id";
import "./row-actions-menu.css";

export interface RowMenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  isDanger?: boolean;
  isDisabled?: boolean;
}

export interface RowActionsMenuProps {
  label?: string;
  items: RowMenuItem[];
  trigger?: ReactNode;
  className?: string;
}

export function RowActionsMenu({ label = "Row actions", items, trigger, className }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useMemo(() => uid("rbm-menu"), []);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        btnRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("keydown", onKeyDown);

    window.setTimeout(() => {
      const first = menuRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])');
      first?.focus();
    }, 0);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []).filter((b) => !b.disabled);
    if (buttons.length === 0) return;

    const current = document.activeElement as HTMLButtonElement | null;
    const idx = buttons.indexOf(current ?? buttons[0]!);

    let next = idx;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = buttons.length - 1;
    if (e.key === "ArrowDown") next = Math.min(buttons.length - 1, idx + 1);
    if (e.key === "ArrowUp") next = Math.max(0, idx - 1);

    buttons[next]?.focus();
  };

  return (
    <div className={cx("rbm-ram", className)}>
      {trigger ? (
        <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      ) : (
        <button
          ref={btnRef}
          type="button"
          className={cx("rbm-ram__btn", "rbm-focus")}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          Actions
        </button>
      )}

      {open ? (
        <ul
          ref={menuRef}
          id={menuId}
          className="rbm-ram__menu"
          role="menu"
          aria-label="Row actions menu"
          onKeyDown={onMenuKeyDown}
        >
          {items.map((it) => (
            <li key={it.key} role="none" className="rbm-ram__item">
              <button
                type="button"
                role="menuitem"
                className={cx("rbm-ram__mi", "rbm-focus", it.isDanger && "rbm-ram__mi--danger")}
                disabled={Boolean(it.isDisabled)}
                onClick={() => {
                  if (it.isDisabled) return;
                  it.onSelect();
                  close();
                  btnRef.current?.focus();
                }}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
