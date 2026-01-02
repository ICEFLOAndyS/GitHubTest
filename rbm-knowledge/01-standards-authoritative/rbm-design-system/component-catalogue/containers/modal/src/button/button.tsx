import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import "./button.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  isLoading = false,
  left,
  right,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      type={type}
      className={cx("rbm-btn", `rbm-btn--${variant}`, `rbm-btn--${size}`, "rbm-focus", isDisabled && "rbm-disabled", className)}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {left ? <span className="rbm-btn__icon" aria-hidden="true">{left}</span> : null}
      <span className="rbm-btn__label">{children}</span>
      {right ? <span className="rbm-btn__icon" aria-hidden="true">{right}</span> : null}
      {isLoading ? <span className="rbm-btn__spinner" aria-hidden="true" /> : null}
    </button>
  );
}
