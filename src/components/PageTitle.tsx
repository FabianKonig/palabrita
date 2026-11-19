import type { ReactNode } from "react";
import { Logo } from "./Brand";

/** Seitenüberschrift mit dem Logo oben rechts. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div className="page-title">
      <h1>{children}</h1>
      <Logo />
    </div>
  );
}
