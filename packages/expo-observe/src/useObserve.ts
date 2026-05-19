import AppMetrics from 'expo-app-metrics';

import { useObserveForRouter } from './integrations/expo-router';
import { useObserveForReactNavigation } from './integrations/react-navigation';

export function useObserve() {
  const routerMarkInteractive = useObserveForRouter();
  const reactNavigationMarkInteractive = useObserveForReactNavigation();
  return {
    markInteractive:
      routerMarkInteractive ?? reactNavigationMarkInteractive ?? AppMetrics.markInteractive,
  };
}
