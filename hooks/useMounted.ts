import { useSyncExternalStore } from "react";

const noop = () => () => {};
/** True on the client after hydration; false during server render. For portals. */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
