import type { ReactNode } from "react";

/** Seitenüberschrift. Das Logo oben rechts setzt die Layout-Komponente in `App.tsx`. */
export function PageTitle({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>;
}
