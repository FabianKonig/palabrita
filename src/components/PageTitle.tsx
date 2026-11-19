import type { ReactNode } from "react";

/**
 * Seitenüberschrift. Das Logo oben rechts setzt die Layout-Komponente in `App.tsx`.
 * `brand` schreibt sie im Stil des Schriftzugs im Logo (Türkis, fett, magentafarbener Schatten).
 */
export function PageTitle({
  children,
  brand = false,
}: {
  children: ReactNode;
  brand?: boolean;
}) {
  return <h1 className={brand ? "page-title-brand" : undefined}>{children}</h1>;
}
