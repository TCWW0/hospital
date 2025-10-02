import type { TeachingLecture } from './teaching.types';

const STORAGE_KEY = 'teaching.lectures.v1';
const BROADCAST_CHANNEL_NAME = 'teaching.lectures.broadcast';
const STATE_VERSION = 1;

interface PersistedState {
  version: number;
  lectures: TeachingLecture[];
  seedSignature?: string;
}

const DEFAULT_STATE: PersistedState = {
  version: STATE_VERSION,
  lectures: [],
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
    const testKey = '__teaching_repo_test__';
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
    channel.postMessage({ type: 'teaching.lectures.changed', version: STATE_VERSION, at: Date.now() });
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
    if (!parsed || typeof parsed.version !== 'number' || !Array.isArray(parsed.lectures)) {
      return deepClone(DEFAULT_STATE);
    }
    const normalized: PersistedState = {
      version: STATE_VERSION,
      lectures: Array.isArray(parsed.lectures) ? parsed.lectures : [],
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
      // ignore write errors
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
    lectures: deepClone(draft.lectures),
    seedSignature: draft.seedSignature
  });
}

export function getLecturesSnapshot(): TeachingLecture[] {
  return deepClone(getState().lectures);
}

export function replaceAllLectures(lectures: TeachingLecture[], seedSignature?: string): TeachingLecture[] {
  const nextState: PersistedState = {
    version: STATE_VERSION,
    lectures: deepClone(lectures),
    seedSignature
  };
  setState(nextState);
  return deepClone(nextState.lectures);
}

export function ensureSeedLectures(seedFactory: () => TeachingLecture[], signature?: string) {
  const state = getState();
  const needsSeed = !state.lectures.length || (signature && state.seedSignature !== signature);
  if (!needsSeed) return;
  replaceAllLectures(seedFactory(), signature);
}

export function addLecture(lecture: TeachingLecture, { prepend = true }: { prepend?: boolean } = {}): TeachingLecture {
  const state = getState();
  const lectures = deepClone(state.lectures);
  const stored = deepClone(lecture);
  if (prepend) {
    lectures.unshift(stored);
  } else {
    lectures.push(stored);
  }
  setState({ ...state, lectures });
  return deepClone(stored);
}

export function updateLecture(
  id: string,
  updater: (draft: TeachingLecture) => void
): TeachingLecture | null {
  const state = getState();
  const lectures = deepClone(state.lectures);
  const index = lectures.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const draft = lectures[index];
  if (!draft) return null;
  updater(draft);
  setState({ ...state, lectures });
  return deepClone(draft);
}

export function findLecture(id: string): TeachingLecture | null {
  const state = getState();
  const found = state.lectures.find((item) => item.id === id);
  return found ? deepClone(found) : null;
}

export function resetLectures() {
  setState(deepClone(DEFAULT_STATE));
}

export function reloadFromStorage(): TeachingLecture[] {
  cache = readState();
  return deepClone(cache.lectures);
}

export function subscribeToExternalLectureChanges(callback: () => void): () => void {
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

export function getLecturesStateVersion() {
  return STATE_VERSION;
}
