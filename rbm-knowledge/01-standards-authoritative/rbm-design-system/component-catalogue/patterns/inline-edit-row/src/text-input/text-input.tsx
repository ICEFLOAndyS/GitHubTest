import type { InputHTMLAttributes } from "react";
import { uid } from "../utils/id";
import { cx } from "../utils/cx";
import "./text-input.css";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  errorText?: string;
}

export function TextInput({ label, helperText, errorText, className, id, ...rest }: TextInputProps) {
  const inputId = id ?? uid("rbm-input");
  const describedBy = errorText ? `${inputId}-err` : helperText ? `${inputId}-help` : undefined;

  return (
    <div className={cx("rbm-field", className)}>
      <label className="rbm-field__label" htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={cx("rbm-input", "rbm-focus", errorText && "rbm-input--error")}
        aria-invalid={Boolean(errorText) || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {errorText ? (
        <div className="rbm-field__error" id={`${inputId}-err`}>{errorText}</div>
      ) : helperText ? (
        <div className="rbm-field__help" id={`${inputId}-help`}>{helperText}</div>
      ) : null}
    </div>
  );
}
