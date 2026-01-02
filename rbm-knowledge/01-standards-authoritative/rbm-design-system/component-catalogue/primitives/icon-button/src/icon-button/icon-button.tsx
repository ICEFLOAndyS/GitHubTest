import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import "./icon-button.css";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  "aria-label": string;
  variant?: "neutral" | "primary" | "danger";
}

export function IconButton({ icon, variant = "neutral", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button type={type} className={cx("rbm-ib", `rbm-ib--${variant}`, "rbm-focus", className)} {...rest}>
      <span className="rbm-ib__icon" aria-hidden="true">{icon}</span>
    </button>
  );
}
