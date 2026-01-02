import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "../primitives/Button";
import { TextInput } from "../primitives/TextInput";
import { cx } from "../utils/cx";
import "./inline-edit-row.css";

export interface InlineEditRowProps {
  label: string;
  initialValue: string;
  validate?: (value: string) => string | null;
  onSave: (value: string) => Promise<void> | void;
  onCancel?: () => void;
  right?: ReactNode;
  className?: string;
}

export function InlineEditRow({ label, initialValue, validate, onSave, onCancel, right, className }: InlineEditRowProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runValidate = (v: string) => {
    const msg = validate ? validate(v) : null;
    setError(msg);
    return msg;
  };

  const save = async () => {
    const msg = runValidate(value);
    if (msg) return;
    setBusy(true);
    try {
      await onSave(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cx("rbm-ier", className)} role="group" aria-label={`${label} editor`}>
      <div className="rbm-ier__field">
        <TextInput
          label={label}
          value={value}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setValue(v);
            if (error) runValidate(v);
          }}
          errorText={error ?? undefined}
        />
      </div>

      <div className="rbm-ier__actions">
        <Button variant="primary" isLoading={busy} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
        <Button variant="ghost" disabled={busy} onClick={() => { if (!busy) onCancel?.(); }}>Cancel</Button>
        {right ? <div className="rbm-ier__right">{right}</div> : null}
      </div>
    </div>
  );
}
