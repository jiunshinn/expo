/* eslint-disable @typescript-eslint/no-require-imports */
const mockNative = {
  configure: jest.fn(),
  setBundleDefaults: jest.fn(),
  dispatchEvents: jest.fn(() => Promise.resolve()),
};

jest.mock('expo', () => ({
  requireNativeModule: jest.fn(() => mockNative),
}));

jest.mock('../integrations/expo-router/router', () => ({
  isRouterInstalled: true,
  optionalRouter: undefined,
}));

jest.mock('../integrations/expo-router/init', () => ({
  initRouterIntegration: jest.fn(),
  isInitialized: jest.fn(() => false),
  initListeners: jest.fn(() => () => {}),
}));

jest.mock('../integrations/react-navigation/reactNavigation', () => ({
  isReactNavigationInstalled: true,
  optionalReactNavigation: undefined,
}));

jest.mock('../integrations/react-navigation/init', () => ({
  initReactNavigationIntegration: jest.fn(),
  isInitialized: jest.fn(() => false),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  jest.doMock('expo', () => ({ requireNativeModule: jest.fn(() => mockNative) }));
  jest.doMock('../integrations/expo-router/router', () => ({
    isRouterInstalled: true,
    optionalRouter: undefined,
  }));
  jest.doMock('../integrations/expo-router/init', () => ({
    initRouterIntegration: jest.fn(),
    isInitialized: jest.fn(() => false),
    initListeners: jest.fn(() => () => {}),
  }));
  jest.doMock('../integrations/react-navigation/reactNavigation', () => ({
    isReactNavigationInstalled: true,
    optionalReactNavigation: undefined,
  }));
  jest.doMock('../integrations/react-navigation/init', () => ({
    initReactNavigationIntegration: jest.fn(),
    isInitialized: jest.fn(() => false),
  }));
});

function loadModule() {
  return require('../module').default as typeof import('../module').default;
}

function loadInit() {
  return require('../integrations/expo-router/init') as typeof import('../integrations/expo-router/init');
}

function loadReactNavigationInit() {
  return require('../integrations/react-navigation/init') as typeof import('../integrations/react-navigation/init');
}

describe('module Proxy', () => {
  it('strips disableRouterIntegration from the config forwarded to native', () => {
    const ExpoObserve = loadModule();
    ExpoObserve.configure({ environment: 'test', disableRouterIntegration: true });
    expect(mockNative.configure).toHaveBeenCalledWith({ environment: 'test' });
  });

  it('strips disableReactNavigationIntegration from the config forwarded to native', () => {
    jest.doMock('../integrations/expo-router/router', () => ({
      isRouterInstalled: false,
      optionalRouter: undefined,
    }));
    const ExpoObserve = loadModule();
    ExpoObserve.configure({ environment: 'test', disableReactNavigationIntegration: true });
    expect(mockNative.configure).toHaveBeenCalledWith({ environment: 'test' });
  });

  it('calls initRouterIntegration when router is installed and integration is enabled', () => {
    const ExpoObserve = loadModule();
    const { initRouterIntegration } = loadInit();
    ExpoObserve.configure({ environment: 'test' });
    expect(initRouterIntegration).toHaveBeenCalledTimes(1);
  });

  it('skips initRouterIntegration when disableRouterIntegration is true', () => {
    const ExpoObserve = loadModule();
    const { initRouterIntegration } = loadInit();
    ExpoObserve.configure({ disableRouterIntegration: true });
    expect(initRouterIntegration).not.toHaveBeenCalled();
  });

  it('skips initRouterIntegration when router is not installed', () => {
    jest.doMock('../integrations/expo-router/router', () => ({
      isRouterInstalled: false,
      optionalRouter: undefined,
    }));
    jest.doMock('../integrations/react-navigation/reactNavigation', () => ({
      isReactNavigationInstalled: false,
      optionalReactNavigation: undefined,
    }));
    const ExpoObserve = loadModule();
    const { initRouterIntegration } = loadInit();
    ExpoObserve.configure({});
    expect(initRouterIntegration).not.toHaveBeenCalled();
  });

  it('calls initReactNavigationIntegration when react-navigation is installed and router is not', () => {
    jest.doMock('../integrations/expo-router/router', () => ({
      isRouterInstalled: false,
      optionalRouter: undefined,
    }));
    const ExpoObserve = loadModule();
    const { initReactNavigationIntegration } = loadReactNavigationInit();
    ExpoObserve.configure({});
    expect(initReactNavigationIntegration).toHaveBeenCalledTimes(1);
  });

  it('does NOT call initReactNavigationIntegration when expo-router is also installed (router wins)', () => {
    const ExpoObserve = loadModule();
    const { initRouterIntegration } = loadInit();
    const { initReactNavigationIntegration } = loadReactNavigationInit();
    ExpoObserve.configure({});
    expect(initRouterIntegration).toHaveBeenCalledTimes(1);
    expect(initReactNavigationIntegration).not.toHaveBeenCalled();
  });

  it('skips initReactNavigationIntegration when disableReactNavigationIntegration is true', () => {
    jest.doMock('../integrations/expo-router/router', () => ({
      isRouterInstalled: false,
      optionalRouter: undefined,
    }));
    const ExpoObserve = loadModule();
    const { initReactNavigationIntegration } = loadReactNavigationInit();
    ExpoObserve.configure({ disableReactNavigationIntegration: true });
    expect(initReactNavigationIntegration).not.toHaveBeenCalled();
  });

  it('passes through dispatchEvents and setBundleDefaults to native', () => {
    const ExpoObserve = loadModule();
    ExpoObserve.dispatchEvents();
    ExpoObserve.setBundleDefaults({ environment: 'production', isJsDev: false });
    expect(mockNative.dispatchEvents).toHaveBeenCalledTimes(1);
    expect(mockNative.setBundleDefaults).toHaveBeenCalledWith({
      environment: 'production',
      isJsDev: false,
    });
  });

  it('returns the native function via Reflect.get for unknown props', () => {
    const ExpoObserve = loadModule();
    expect((ExpoObserve as { dispatchEvents: unknown }).dispatchEvents).toBe(
      mockNative.dispatchEvents
    );
  });
});
