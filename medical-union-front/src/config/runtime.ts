import type { LoginRequest } from '@/types';

const API_MOCK_STORAGE_KEY = 'medical_union_use_mock';
const AUTH_MOCK_ENV_KEY = 'VITE_USE_MOCK_AUTH';

function readBooleanEnv(key: string): boolean | undefined {
  const raw = import.meta.env[key as keyof ImportMetaEnv];
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}

function readBooleanStorage(key: string): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch (error) {
    console.warn(`[runtime] Failed to read ${key} from storage:`, error);
  }
  return undefined;
}

function determineMockApiPreference(): boolean {
  const stored = readBooleanStorage(API_MOCK_STORAGE_KEY);
  if (typeof stored === 'boolean') {
    return stored;
  }

  const envMock = readBooleanEnv('VITE_USE_MOCK_API');
  if (typeof envMock === 'boolean') {
    return envMock;
  }

  const envReal = readBooleanEnv('VITE_USE_REAL_API');
  if (typeof envReal === 'boolean') {
    return !envReal;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL;
  return !apiBase;
}

function determineMockAuthPreference(): boolean {
  const envMockAuth = readBooleanEnv(AUTH_MOCK_ENV_KEY);
  if (typeof envMockAuth === 'boolean') {
    return envMockAuth;
  }
  return determineMockApiPreference();
}

export function shouldUseMockApi(): boolean {
  return determineMockApiPreference();
}

export function shouldUseMockAuth(): boolean {
  return determineMockAuthPreference();
}

export function getApiBaseUrl(): string | undefined {
  if (import.meta.env.DEV) {
    return undefined;
  }
  return import.meta.env.VITE_API_BASE_URL;
}

export function getApiTimeout(): number {
  const raw = import.meta.env.VITE_API_TIMEOUT;
  const parsed = raw ? Number(raw) : undefined;
  return Number.isFinite(parsed) ? Number(parsed) : 10000;
}

export type LoginDispatcher = (payload: LoginRequest) => Promise<unknown>;
