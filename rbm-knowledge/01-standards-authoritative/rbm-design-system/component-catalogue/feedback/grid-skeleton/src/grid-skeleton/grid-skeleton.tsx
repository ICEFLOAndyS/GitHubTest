import "./grid-skeleton.css";
import { Skeleton } from "./Skeleton";

export interface GridSkeletonProps { rows?: number; columns?: number; }

export function GridSkeleton({ rows = 6, columns = 4 }: GridSkeletonProps) {
  return (
    <div className="rbm-gsk" role="status" aria-label="Loading">
      <div className="rbm-gsk__head">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} variant="line" className="rbm-gsk__cell" />
        ))}
      </div>
      <div className="rbm-gsk__body">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`r-${r}`} className="rbm-gsk__row">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={`c-${r}-${c}`} variant="line" className="rbm-gsk__cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
