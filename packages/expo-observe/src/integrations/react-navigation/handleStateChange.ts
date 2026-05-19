import AppMetrics from 'expo-app-metrics';

import {
  collectMountedKeys,
  findFocusedLeaf,
  type NavigationRouteLike,
  type NavigationStateLike,
} from './stateTraversal';
import type { ReactNavigationIntegrationStorage } from './storage';

export type GetPathname = (
  state: NavigationStateLike | undefined,
  focusedRoute: NavigationRouteLike
) => string;

export function createStateChangeHandler(
  storage: ReactNavigationIntegrationStorage,
  getPathname: GetPathname,
  appLaunchTime: number
): (state: NavigationStateLike | undefined) => void {
  let previousFocusedKey: string | null = null;

  return async function handleStateChange(state) {
    if (!state) return;
    // Snapshot clocks once so every metric written below is stamped with
    // the moment the focus actually fired, not the moment
    // `addCustomMetricToSession` happens to run after the awaited
    // `getMainSession()` round-trip.
    const now = performance.now();
    const timestamp = new Date().toISOString();
    // Mark all non-focused mounted screens as already rendered so a later
    // focus on them resolves to `warm_ttr`. Tab-navigator siblings are
    // skipped by `collectMountedKeys` because `lazy: true` (the v7 default)
    // leaves unfocused tabs unmounted.
    const mounted = collectMountedKeys(state);
    const focused = findFocusedLeaf(state);
    // Mostly to satisfy typescript. This should not happen
    if (!focused) return;

    // This needs to happen before keys are added to renderedScreensIds
    const isInitial = !storage.renderedScreensIds.has(focused.key);
    // We want to collect the preloaded screens even if the focused route
    // didn't change. The preload can happen without the focus to change.
    for (const key of mounted.keys()) {
      storage.renderedScreensIds.add(key);
    }

    if (focused.key === previousFocusedKey) return;
    previousFocusedKey = focused.key;

    const pathname = getPathname(state, focused.route);
    const routeParams = focused.route.params ?? {};
    const name = isInitial ? 'cold_ttr' : 'warm_ttr';

    const mainSessionId = (await AppMetrics.getMainSession())?.id;
    if (!mainSessionId) return;

    if (!storage.hasRecordedInitialTtr) {
      const appLaunchTtrSeconds = (now - appLaunchTime) / 1000;
      storage.hasRecordedInitialTtr = true;
      const existing = storage.screenTimes[focused.key];
      if (existing) {
        storage.screenTimes[focused.key] = { ...existing, pathname };
      }
      AppMetrics.addCustomMetricToSession({
        sessionId: mainSessionId,
        timestamp,
        category: 'navigation',
        name,
        routeName: pathname,
        value: appLaunchTtrSeconds,
        params: { isAppLaunch: true, routeParams },
      });
      return;
    }

    const last = storage.pendingActions[storage.pendingActions.length - 1];
    if (!last) return;
    const dispatchTime = last.dispatchTime;
    storage.screenTimes[focused.key] = {
      ...storage.screenTimes[focused.key],
      dispatchTime,
      pathname,
    };

    AppMetrics.addCustomMetricToSession({
      sessionId: mainSessionId,
      timestamp,
      category: 'navigation',
      name,
      routeName: pathname,
      value: (now - dispatchTime) / 1000,
      params: { isAppLaunch: false, routeParams },
    });
    storage.pendingActions.length = 0;
  };
}
