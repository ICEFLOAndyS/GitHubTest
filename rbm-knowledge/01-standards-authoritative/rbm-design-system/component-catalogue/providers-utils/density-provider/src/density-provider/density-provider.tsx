import type { ReactNode } from "react";
import { useEffect } from "react";

export type Density = "compact" | "cozy" | "comfortable";

export function DensityProvider({ density, children }: { density: Density; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  return children;
}
