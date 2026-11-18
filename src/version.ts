/**
 * Versionsstempel der App.
 *
 * `__APP_VERSION__` setzt `vite.config.ts` beim Bauen: Zeitstempel des
 * HEAD-Commits (bei einem Merge auf `main` also der Merge-Zeitpunkt), immer
 * in UTC. Der Wert wird nicht von Hand gepflegt.
 */
declare const __APP_VERSION__: string;

export const APP_VERSION: string = __APP_VERSION__;
