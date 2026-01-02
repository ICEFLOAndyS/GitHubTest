import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import "./audit-trail.css";

export interface AuditItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  summary?: string;
  meta?: Array<{ key: string; value: string }>;
  right?: ReactNode;
}

export interface AuditTrailProps {
  ariaLabel: string;
  items: AuditItem[];
  emptyTitle?: string;
  emptyBody?: string;
  className?: string;
}

export function AuditTrail({ ariaLabel, items, emptyTitle = "No audit activity", emptyBody = "No actions have been recorded.", className }: AuditTrailProps) {
  if (items.length === 0) {
    return (
      <div className={cx("rbm-audit-empty", className)} role="status" aria-label={ariaLabel}>
        <div className="rbm-audit-empty__title">{emptyTitle}</div>
        <div className="rbm-audit-empty__body">{emptyBody}</div>
      </div>
    );
  }

  return (
    <ol className={cx("rbm-audit", className)} aria-label={ariaLabel}>
      {items.map((it) => (
        <li key={it.id} className="rbm-audit__item">
          <div className="rbm-audit__main">
            <div className="rbm-audit__top">
              <div className="rbm-audit__action">
                <span className="rbm-audit__actor">{it.actor}</span>
                <span className="rbm-audit__verb">{it.action}</span>
              </div>
              <time className="rbm-audit__time">{it.timestamp}</time>
            </div>

            {it.summary ? <div className="rbm-audit__summary">{it.summary}</div> : null}

            {it.meta && it.meta.length > 0 ? (
              <dl className="rbm-audit__meta">
                {it.meta.map((m) => (
                  <div key={`${it.id}-${m.key}`} className="rbm-audit__metaRow">
                    <dt className="rbm-audit__metaKey">{m.key}</dt>
                    <dd className="rbm-audit__metaVal">{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {it.right ? <div className="rbm-audit__right">{it.right}</div> : null}
        </li>
      ))}
    </ol>
  );
}
