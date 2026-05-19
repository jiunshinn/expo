import { type NavigationRouteLike, type NavigationStateLike } from './stateTraversal';
import type { ReactNavigationIntegrationStorage } from './storage';
export type GetPathname = (state: NavigationStateLike | undefined, focusedRoute: NavigationRouteLike) => string;
export declare function createStateChangeHandler(storage: ReactNavigationIntegrationStorage, getPathname: GetPathname, appLaunchTime: number): (state: NavigationStateLike | undefined) => void;
//# sourceMappingURL=handleStateChange.d.ts.map