import { cx } from "../utils/cx";
import { Button } from "../primitives/Button";
import "./pagination.css";

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function Pagination({ page, pageSize, totalItems, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clamp(page, 1, totalPages);

  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  return (
    <div className={cx("rbm-pg", className)} role="navigation" aria-label="Pagination">
      <div className="rbm-pg__range" aria-label="Results range">
        {start}–{end} of {totalItems}
      </div>

      <div className="rbm-pg__controls" role="group" aria-label="Page controls">
        <Button variant="ghost" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>Previous</Button>

        <div className="rbm-pg__page" aria-label="Current page">
          Page <span className="rbm-pg__pageNum">{safePage}</span> of {totalPages}
        </div>

        <Button variant="ghost" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)}>Next</Button>
      </div>
    </div>
  );
}
