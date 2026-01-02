import type { ReactNode } from "react";
import { Modal } from "../containers/Modal";
import "./confirm-dialog.css";

export type ConfirmIntent = "neutral" | "danger";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  body: ReactNode;
  intent?: ConfirmIntent;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, body, intent = "neutral", confirmLabel, cancelLabel = "Cancel", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className={`rbm-confirm rbm-confirm--${intent}`}>
      <Modal
        isOpen={isOpen}
        title={title}
        primaryLabel={confirmLabel}
        onPrimary={onConfirm}
        secondaryLabel={cancelLabel}
        onSecondary={onCancel}
        onClose={onCancel}
      >
        {body}
      </Modal>
    </div>
  );
}
