import type { ReactNode } from "react";
import { Mark } from "./Brand";

/** Seitenüberschrift mit dem kleinen Markenzeichen oben rechts. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div className="page-title">
      <h1>{children}</h1>
      <Mark />
    </div>
  );
}
