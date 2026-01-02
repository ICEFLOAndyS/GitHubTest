import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import "./result-state.css";

export type ResultStateKind = "empty" | "no-results";

export interface ResultStateProps {
  kind: ResultStateKind;
  title?: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

export function ResultState({ kind, title, body, action, className }: ResultStateProps) {
  const defaultTitle = kind === "empty" ? "Nothing here yet" : "No results";
  const defaultBody = kind === "empty" ? "Create your first item to get started." : "Try adjusting your search or filters.";

  return (
    <div className={cx("rbm-rs", className)} role="status" aria-label={kind === "empty" ? "Empty state" : "No results"}>
      <div className="rbm-rs__title">{title ?? defaultTitle}</div>
      <div className="rbm-rs__body">{body ?? defaultBody}</div>
      {action ? <div className="rbm-rs__action">{action}</div> : null}
    </div>
  );
}
