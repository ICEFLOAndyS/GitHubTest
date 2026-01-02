import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";
import "./status-pill.css";

export type RbmStatusIntent = "neutral" | "info" | "success" | "warning" | "critical";

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  intent: RbmStatusIntent;
  label: string;
}

export function StatusPill({ intent, label, className, ...rest }: StatusPillProps) {
  return (
    <span className={cx("rbm-pill", `rbm-pill--${intent}`, className)} {...rest}>
      {label}
    </span>
  );
}
