import AppMetrics from 'expo-app-metrics';

import { createStateChangeHandler, type GetPathname } from '../handleStateChange';
import type { NavigationRouteLike, NavigationStateLike } from '../stateTraversal';
import {
  createReactNavigationIntegrationStorage,
  type ReactNavigationIntegrationStorage,
} from '../storage';

jest.mock('expo-app-metrics', () => {
  const addCustomMetricToSession = jest.fn();
  const getMainSession = jest.fn(async () => ({ id: 'session-1' }));
  return {
    __esModule: true,
    default: {
      markInteractive: jest.fn(),
      getMainSession,
      addCustomMetricToSession,
    },
  };
});

const mockAddCustomMetric = AppMetrics.addCustomMetricToSession as jest.Mock;
const mockSessionId = 'session-1';

const getPathname: GetPathname = (_state, route: NavigationRouteLike) => `/${route.name}`;

function stackState(
  routes: { key: string; name?: string; params?: object }[],
  index = routes.length - 1
): NavigationStateLike {
  return {
    type: 'stack',
    index,
    routes: routes.map((r) => ({ key: r.key, name: r.name ?? r.key, params: r.params })),
    routeNames: [],
    stale: false,
    key: 'test',
  };
}

function tabState(routes: { key: string; name?: string }[], index: number): NavigationStateLike {
  return {
    type: 'tab',
    index,
    routes: routes.map((r) => ({ key: r.key, name: r.name ?? r.key })),
    routeNames: [],
    stale: false,
    key: 'test',
  };
}

function flushAsync() {
  return new Promise((resolve) => setImmediate(resolve));
}

let storage: ReactNavigationIntegrationStorage;
let handle: (state: NavigationStateLike | undefined) => void;
let appLaunchTime: number;
let logSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  storage = createReactNavigationIntegrationStorage();
  appLaunchTime = performance.now();
  handle = createStateChangeHandler(storage, getPathname, appLaunchTime);
});

afterEach(() => {
  expect(logSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
});

describe('createStateChangeHandler', () => {
  it('records cold_ttr with isAppLaunch=true on the first focused state', async () => {
    jest.spyOn(performance, 'now').mockReturnValue(appLaunchTime + 100);
    handle(stackState([{ key: 'a' }]));
    await flushAsync();

    expect(mockAddCustomMetric).toHaveBeenCalledTimes(1);
    expect(mockAddCustomMetric).toHaveBeenCalledWith({
      sessionId: mockSessionId,
      timestamp: expect.any(String),
      category: 'navigation',
      name: 'cold_ttr',
      routeName: '/a',
      value: expect.closeTo(0.1, 2),
      params: { isAppLaunch: true, routeParams: {} },
    });
  });

  it('records cold_ttr with isAppLaunch=false on subsequent navigations to a new screen', async () => {
    handle(stackState([{ key: 'a' }], 0));
    await flushAsync();
    mockAddCustomMetric.mockClear();

    storage.pendingActions.push({ actionType: 'NAVIGATE', dispatchTime: performance.now() });
    handle(stackState([{ key: 'a' }, { key: 'b' }], 1));
    await flushAsync();

    expect(mockAddCustomMetric).toHaveBeenCalledTimes(1);
    expect(mockAddCustomMetric.mock.calls[0][0].name).toBe('cold_ttr');
    expect(mockAddCustomMetric.mock.calls[0][0].params).toEqual({
      isAppLaunch: false,
      routeParams: {},
    });
  });

  it('records warm_ttr when revisiting a previously focused screen', async () => {
    handle(stackState([{ key: 'a' }], 0));
    await flushAsync();

    storage.pendingActions.push({ actionType: 'NAVIGATE', dispatchTime: performance.now() });
    handle(stackState([{ key: 'a' }, { key: 'b' }], 1));
    await flushAsync();

    storage.pendingActions.push({ actionType: 'GO_BACK', dispatchTime: performance.now() });
    handle(stackState([{ key: 'a' }], 0));
    await flushAsync();

    expect(mockAddCustomMetric).toHaveBeenCalledTimes(3);
    expect(mockAddCustomMetric.mock.calls[0][0].name).toBe('cold_ttr');
    expect(mockAddCustomMetric.mock.calls[0][0].params.isAppLaunch).toBe(true);
    expect(mockAddCustomMetric.mock.calls[1][0].name).toBe('cold_ttr');
    expect(mockAddCustomMetric.mock.calls[1][0].params.isAppLaunch).toBe(false);
    expect(mockAddCustomMetric.mock.calls[2][0].name).toBe('warm_ttr');
  });

  it('does not emit when the focused key is unchanged (param-only state update)', async () => {
    handle(stackState([{ key: 'a' }]));
    await flushAsync();
    mockAddCustomMetric.mockClear();

    handle(stackState([{ key: 'a', params: { x: '1' } }]));
    await flushAsync();
    expect(mockAddCustomMetric).not.toHaveBeenCalled();
  });

  it('emits cold_ttr for first focus of each tab; tab siblings are not preemptively marked', async () => {
    handle(tabState([{ key: 'home' }, { key: 'settings' }], 0));
    await flushAsync();
    mockAddCustomMetric.mockClear();

    storage.pendingActions.push({ actionType: 'JUMP_TO', dispatchTime: performance.now() });
    handle(tabState([{ key: 'home' }, { key: 'settings' }], 1));
    await flushAsync();

    storage.pendingActions.push({ actionType: 'JUMP_TO', dispatchTime: performance.now() });
    handle(tabState([{ key: 'home' }, { key: 'settings' }], 0));
    await flushAsync();

    expect(mockAddCustomMetric).toHaveBeenCalledTimes(2);
    expect(mockAddCustomMetric.mock.calls[0][0].name).toBe('cold_ttr');
    expect(mockAddCustomMetric.mock.calls[1][0].name).toBe('warm_ttr');
  });

  it('passes the focused route params through as routeParams on the emitted metric', async () => {
    handle(stackState([{ key: 'a', name: 'A', params: { id: '42' } }]));
    await flushAsync();

    expect(mockAddCustomMetric.mock.calls[0][0].params).toEqual({
      isAppLaunch: true,
      routeParams: { id: '42' },
    });
  });

  it('stashes pathname onto screenTimes when a dispatched TTR is emitted', async () => {
    handle(stackState([{ key: 'a' }], 0));
    await flushAsync();
    expect(storage.screenTimes['a']).toBeUndefined();

    storage.pendingActions.push({ actionType: 'NAVIGATE', dispatchTime: performance.now() });
    handle(stackState([{ key: 'a' }, { key: 'b' }], 1));
    await flushAsync();

    expect(storage.screenTimes['b']?.pathname).toBe('/b');
    expect(typeof storage.screenTimes['b']?.dispatchTime).toBe('number');
  });

  it('treats undefined state as a no-op', async () => {
    handle(undefined);
    await flushAsync();
    expect(mockAddCustomMetric).not.toHaveBeenCalled();
  });

  it('adds non-focused mounted stack screens to renderedScreensIds so revisits become warm_ttr', async () => {
    handle(stackState([{ key: 'a' }, { key: 'b' }], 1));
    await flushAsync();
    expect(storage.renderedScreensIds.has('a')).toBe(true);
    expect(storage.renderedScreensIds.has('b')).toBe(true);

    mockAddCustomMetric.mockClear();
    storage.pendingActions.push({ actionType: 'GO_BACK', dispatchTime: performance.now() });
    handle(stackState([{ key: 'a' }], 0));
    await flushAsync();

    expect(mockAddCustomMetric).toHaveBeenCalledTimes(1);
    expect(mockAddCustomMetric.mock.calls[0][0].name).toBe('warm_ttr');
  });
});
