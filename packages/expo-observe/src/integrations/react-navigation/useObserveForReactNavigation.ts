import AppMetrics, { type MetricAttributes } from 'expo-app-metrics';
import { use, useCallback, useEffect, useRef } from 'react';

import { ObserveReactNavigationIntegrationContext } from './context';
import { isInitialized } from './init';
import { optionalReactNavigation } from './reactNavigation';

type MarkInteractive = (typeof AppMetrics)['markInteractive'];

export function useObserveForReactNavigation(): MarkInteractive | null {
  const contextValue = use(ObserveReactNavigationIntegrationContext);
  const isMounted = useRef(true);
  const route = optionalReactNavigation?.useRoute();
  const navigation = optionalReactNavigation?.useNavigation();

  const initializedAtMount = useRef(isInitialized());
  if (initializedAtMount.current !== isInitialized()) {
    throw new Error(
      "[expo-observe] React Navigation integration was toggled during a screen's lifecycle. " +
        'Call `ExpoObserve.configure({ disableReactNavigationIntegration })` once at startup before any screen mounts.'
    );
  }

  const screenId = route?.key;
  const prevScreenId = useRef(screenId);
  if (prevScreenId.current !== screenId) {
    console.warn(
      '[expo-observe] Screen ID changed between renders. The hook should be called inside the screen component, not a higher wrapper.'
    );
    prevScreenId.current = screenId;
  }

  useEffect(() => {
    // Strict-mode mounts the effect twice (mount → cleanup → re-mount). Without
    // restoring isMounted here the second mount would leave it permanently false.
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const markInteractive = useCallback(
    async (attributes?: MetricAttributes) => {
      const now = performance.now();
      const timestamp = new Date().toISOString();
      if (!isMounted.current) {
        console.warn('[expo-observe] Calling markInteractive on unmounted screen');
        return;
      }
      if (!screenId) {
        console.warn(
          '[expo-observe] No metadata available for the current screen. Make sure to call useObserve inside a screen component.'
        );
        return;
      }

      if (!contextValue) {
        throw new Error(
          '[expo-observe] markInteractive was called without an active ObserveNavigationContainer. Wrap your tree in <ObserveNavigationContainer>.'
        );
      }
      const { storage } = contextValue;
      if (!route) return;
      const routeParams = (route.params as object | undefined) ?? {};
      // Prefer the pathname captured at TTR-emit time so `tti` carries the
      // same `routeName` the matching `cold_ttr` / `warm_ttr` did. The bare
      // `/<name>` fallback only fires when markInteractive is called before
      // any state event has stamped a pathname — the same fallback the state
      // handler would produce with an undefined state.
      const pathname = storage.screenTimes[screenId]?.pathname ?? `/${route.name}`;

      if (navigation?.isFocused()) {
        AppMetrics.markInteractive({
          ...(attributes ?? {}),
          routeName: pathname,
        });
      }

      // Snapshot times BEFORE writing the new interactive timestamp so the
      // duplicate-detection logic below sees the previous call, not this one.
      const currentScreenData = storage.screenTimes[screenId];

      storage.interactiveScreensIds.add(screenId);
      if (storage.screenTimes[screenId]) {
        storage.screenTimes[screenId] = {
          ...storage.screenTimes[screenId],
          lastInteractiveCall: now,
        };
      }

      if (!currentScreenData?.dispatchTime) return;

      const previousInteractiveCall = currentScreenData.lastInteractiveCall;
      const previousWasAfterDispatch =
        previousInteractiveCall != null && currentScreenData.dispatchTime < previousInteractiveCall;

      if (previousWasAfterDispatch) {
        // Record interactive once per navigation.
        return;
      }

      const interactiveTimeSeconds = (now - currentScreenData.dispatchTime) / 1000;
      const mainSessionId = (await AppMetrics.getMainSession())?.id;
      if (mainSessionId) {
        await AppMetrics.addCustomMetricToSession({
          sessionId: mainSessionId,
          timestamp,
          category: 'navigation',
          routeName: pathname,
          name: 'tti',
          value: interactiveTimeSeconds,
          params: { routeParams },
        });
      }
    },
    [screenId, navigation, route, contextValue]
  );

  return initializedAtMount.current ? markInteractive : null;
}
