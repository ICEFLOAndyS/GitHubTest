import type { ReactNode } from "react";
import { useEffect } from "react";
import { cx } from "../utils/cx";
import { Button } from "../primitives/Button";
import "./side-panel.css";

export interface SidePanelProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: "md" | "lg";
  footer?: ReactNode;
}

export function SidePanel({ isOpen, title, children, onClose, width = "md", footer }: SidePanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="rbm-sp__backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className={cx("rbm-sp", `rbm-sp--${width}`, "rbm-focus")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header className="rbm-sp__header">
          <h2 className="rbm-sp__title">{title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </header>

        <div className="rbm-sp__body">{children}</div>

        {footer ? <footer className="rbm-sp__footer">{footer}</footer> : null}
      </aside>
    </div>
  );
}
