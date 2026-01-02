import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import { StatusPill, type RbmStatusIntent } from "./StatusPill";
import "./steps.css";

export type StepState = "planned" | "active" | "blocked" | "paused" | "completed" | "failed";

export interface StepItem {
  id: string;
  title: string;
  subtitle?: string;
  state: StepState;
  stateLabel: string;
  right?: ReactNode;
  onClick?: () => void;
}

function intentFor(state: StepState): RbmStatusIntent {
  if (state === "active") return "info";
  if (state === "blocked") return "critical";
  if (state === "paused") return "warning";
  if (state === "completed") return "success";
  if (state === "failed") return "critical";
  return "neutral";
}

export interface StepsProps {
  ariaLabel: string;
  items: StepItem[];
  className?: string;
}

export function Steps({ ariaLabel, items, className }: StepsProps) {
  return (
    <ol className={cx("rbm-steps", className)} aria-label={ariaLabel}>
      {items.map((s, idx) => {
        const clickable = Boolean(s.onClick);
        return (
          <li key={s.id} className="rbm-steps__item">
            <div className="rbm-steps__rail" aria-hidden="true">
              <div className={cx("rbm-steps__dot", `rbm-steps__dot--${s.state}`)} />
              {idx < items.length - 1 ? <div className="rbm-steps__line" /> : null}
            </div>

            <div className={cx("rbm-steps__card", clickable && "rbm-steps__card--clickable")}>
              <div className="rbm-steps__main">
                <div className="rbm-steps__top">
                  <div className="rbm-steps__titleWrap">
                    {clickable ? (
                      <button type="button" className={cx("rbm-steps__titleBtn", "rbm-focus")} onClick={s.onClick}>
                        {s.title}
                      </button>
                    ) : (
                      <div className="rbm-steps__title">{s.title}</div>
                    )}
                    {s.subtitle ? <div className="rbm-steps__sub">{s.subtitle}</div> : null}
                  </div>

                  <StatusPill intent={intentFor(s.state)} label={s.stateLabel} />
                </div>
              </div>

              {s.right ? <div className="rbm-steps__right">{s.right}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
