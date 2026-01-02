import "./panel-skeleton.css";
import { Skeleton } from "./Skeleton";

export function PanelSkeleton() {
  return (
    <div className="rbm-psk" role="status" aria-label="Loading">
      <Skeleton variant="line" className="rbm-psk__title" />
      <Skeleton variant="line" />
      <Skeleton variant="line" />
      <Skeleton variant="line" />
      <Skeleton variant="block" className="rbm-psk__block" />
    </div>
  );
}
