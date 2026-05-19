export interface ScreenTimes {
  dispatchTime: number;
  lastInteractiveCall?: number;
  // Pathname stamped at TTR-emit time so a later `tti` write for the same
  // screen uses the identical `routeName` instead of re-deriving from a
  // partial state.
  pathname?: string;
}

export interface PendingAction {
  actionType: string;
  dispatchTime: number;
}

export interface ReactNavigationIntegrationStorage {
  pendingActions: PendingAction[];
  renderedScreensIds: Set<string>;
  hasRecordedInitialTtr: boolean;
  screenTimes: Record<string, ScreenTimes>;
  interactiveScreensIds: Set<string>;
}

export function createReactNavigationIntegrationStorage(): ReactNavigationIntegrationStorage {
  return {
    pendingActions: [],
    renderedScreensIds: new Set(),
    hasRecordedInitialTtr: false,
    screenTimes: {},
    interactiveScreensIds: new Set(),
  };
}
