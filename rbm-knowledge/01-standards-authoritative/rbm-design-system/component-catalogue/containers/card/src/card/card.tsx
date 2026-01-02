import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import "./card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerRight?: ReactNode;
}

export function Card({ title, headerRight, className, children, ...rest }: CardProps) {
  return (
    <section className={cx("rbm-card", className)} {...rest}>
      {(title || headerRight) ? (
        <header className="rbm-card__header">
          {title ? <h3 className="rbm-card__title">{title}</h3> : <span />}
          {headerRight ? <div className="rbm-card__right">{headerRight}</div> : null}
        </header>
      ) : null}
      <div className="rbm-card__body">{children}</div>
    </section>
  );
}
