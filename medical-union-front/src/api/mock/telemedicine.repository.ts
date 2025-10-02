import type { TelemedicineApp } from './telemedicine.types';

const STORAGE_KEY = 'telemedicine.apps.v1';
const BROADCAST_CHANNEL_NAME = 'telemedicine.apps.broadcast';
const STATE_VERSION = 1;

interface PersistedState {
  version: number;
  apps: TelemedicineApp[];
  seedSignature?: string;
}

const DEFAULT_STATE: PersistedState = {
  version: STATE_VERSION,
  apps: [],
  seedSignature: undefined
};

let cache: PersistedState | null = null;
let memoryState: PersistedState = deepClone(DEFAULT_STATE);
let broadcastChannel: BroadcastChannel | null = null;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const { localStorage } = window;
    const testKey = '__telemedicine_repo_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _err
  ) {
    return null;
  }
}

const storage = getStorage();

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.BroadcastChannel === 'undefined') return null;
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
  return broadcastChannel;
}

function notifyExternalChange() {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage({ type: 'telemedicine.apps.changed', version: STATE_VERSION, at: Date.now() });
  }
}

function readState(): PersistedState {
  if (!storage) {
    return deepClone(memoryState);
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return deepClone(DEFAULT_STATE);
  }
  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || typeof parsed.version !== 'number' || !Array.isArray(parsed.apps)) {
      return deepClone(DEFAULT_STATE);
    }
    const normalized: PersistedState = {
      version: STATE_VERSION,
      apps: Array.isArray(parsed.apps) ? parsed.apps : [],
      seedSignature: parsed.seedSignature
    };
    if (parsed.version !== STATE_VERSION) {
      normalized.seedSignature = undefined;
    }
    return deepClone(normalized);
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _err
  ) {
    return deepClone(DEFAULT_STATE);
  }
}

function writeState(next: PersistedState) {
  cache = deepClone(next);
  memoryState = deepClone(next);
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _err
    ) {
      // ignore write errors (e.g. quota exceeded)
    }
  }
  notifyExternalChange();
}

function getState(): PersistedState {
  if (!cache) {
    cache = readState();
  }
  return cache;
}

function setState(draft: PersistedState) {
  writeState({
    version: STATE_VERSION,
    apps: deepClone(draft.apps),
    seedSignature: draft.seedSignature
  });
}

export function getAppsSnapshot(): TelemedicineApp[] {
  return deepClone(getState().apps);
}

export function replaceAllApps(apps: TelemedicineApp[], seedSignature?: string): TelemedicineApp[] {
  const nextState: PersistedState = {
    version: STATE_VERSION,
    apps: deepClone(apps),
    seedSignature
  };
  setState(nextState);
  return deepClone(nextState.apps);
}

export function ensureSeedApps(seedFactory: () => TelemedicineApp[], signature?: string) {
  const state = getState();
  const needsSeed = !state.apps.length || (signature && state.seedSignature !== signature);
  if (!needsSeed) return;
  replaceAllApps(seedFactory(), signature);
}

export function addApp(app: TelemedicineApp, { prepend = true }: { prepend?: boolean } = {}): TelemedicineApp {
  const state = getState();
  const apps = deepClone(state.apps);
  const stored = deepClone(app);
  if (prepend) {
    apps.unshift(stored);
  } else {
    apps.push(stored);
  }
  setState({ ...state, apps });
  return deepClone(stored);
}

export function updateApp(
  id: string,
  updater: (draft: TelemedicineApp) => void
): TelemedicineApp | null {
  const state = getState();
  const apps = deepClone(state.apps);
  const index = apps.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const draft = apps[index];
  if (!draft) return null;
  updater(draft);
  setState({ ...state, apps });
  return deepClone(draft);
}

export function findApp(id: string): TelemedicineApp | null {
  const state = getState();
  const found = state.apps.find((item) => item.id === id);
  return found ? deepClone(found) : null;
}

export function resetApps() {
  setState(deepClone(DEFAULT_STATE));
}

export function reloadFromStorage(): TelemedicineApp[] {
  cache = readState();
  return deepClone(cache.apps);
}

export function subscribeToExternalChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const trigger = () => {
    reloadFromStorage();
    callback();
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      trigger();
    }
  };

  window.addEventListener('storage', storageHandler);

  const channel = getBroadcastChannel();
  let channelHandler: ((event: MessageEvent) => void) | null = null;
  if (channel) {
    channelHandler = () => trigger();
    channel.addEventListener('message', channelHandler);
  }

  return () => {
    window.removeEventListener('storage', storageHandler);
    if (channel && channelHandler) {
      channel.removeEventListener('message', channelHandler);
    }
  };
}

export function getStateVersion() {
  return STATE_VERSION;
}
