import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";
import "./skeleton.css";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> { variant?: "line" | "block"; }

export function Skeleton({ variant = "line", className, ...rest }: SkeletonProps) {
  return <div className={cx("rbm-skel", `rbm-skel--${variant}`, className)} {...rest} />;
}
