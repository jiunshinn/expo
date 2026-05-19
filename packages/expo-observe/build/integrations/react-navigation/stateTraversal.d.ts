import type { NavigationRoute, NavigationState } from '@react-navigation/native';
export type NavigationRouteLike = NavigationRoute<any, string> & {
    state: NavigationState;
};
export type NavigationStateLike = NavigationState;
export declare function findFocusedLeaf(state: NavigationStateLike): {
    route: NavigationRouteLike;
    key: string;
} | null;
export declare function collectMountedKeys(state: NavigationStateLike): Map<string, NavigationRouteLike>;
//# sourceMappingURL=stateTraversal.d.ts.map