import { requireNativeModule } from 'expo';

import { initRouterIntegration } from './integrations/expo-router/init';
import { isRouterInstalled } from './integrations/expo-router/router';
import { initReactNavigationIntegration } from './integrations/react-navigation/init';
import { isReactNavigationInstalled } from './integrations/react-navigation/reactNavigation';
import type { Config, ExpoObserveModuleType } from './types';

const native = requireNativeModule<ExpoObserveModuleType>('ExpoObserve');

const ExpoObserve: ExpoObserveModuleType = new Proxy(native, {
  get(target, prop, receiver) {
    if (prop === 'configure') {
      return (config: Config) => {
        const { disableRouterIntegration, disableReactNavigationIntegration, ...nativeConfig } =
          config;
        if (!disableRouterIntegration && isRouterInstalled) {
          initRouterIntegration();
        } else if (!disableReactNavigationIntegration && isReactNavigationInstalled) {
          initReactNavigationIntegration();
        }
        return target.configure(nativeConfig);
      };
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default ExpoObserve;
