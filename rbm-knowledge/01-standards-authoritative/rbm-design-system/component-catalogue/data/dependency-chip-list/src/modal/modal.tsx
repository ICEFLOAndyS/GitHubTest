import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "../primitives/Button";
import { cx } from "../utils/cx";
import "./modal.css";

export interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose: () => void;
}

export function Modal({
  isOpen,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel = "Cancel",
  onSecondary,
  onClose,
}: ModalProps) {
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
    <div className="rbm-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className={cx("rbm-modal", "rbm-focus")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header className="rbm-modal__header">
          <h2 className="rbm-modal__title">{title}</h2>
        </header>

        <div className="rbm-modal__body">{children}</div>

        <footer className="rbm-modal__footer">
          <Button variant="ghost" onClick={onSecondary ?? onClose}>{secondaryLabel}</Button>
          <Button variant="primary" onClick={onPrimary}>{primaryLabel}</Button>
        </footer>
      </div>
    </div>
  );
}
