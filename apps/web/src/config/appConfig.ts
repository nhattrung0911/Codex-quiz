import type { ApiMode, AuthProviderMode } from '../api/types';

export interface QuizForgeConfigInput {
  apiMode?: ApiMode;
  apiBaseUrl?: string;
  wsUrl?: string;
  authProviderMode?: AuthProviderMode;
  basename?: string;
  accessToken?: string;
  onUnauthorized?: () => void;
}

export interface QuizForgeConfig {
  apiMode: ApiMode;
  apiBaseUrl: string;
  wsUrl?: string;
  authProviderMode: AuthProviderMode;
  basename: string;
  accessToken?: string;
  onUnauthorized?: () => void;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function normalizeBasename(value?: string) {
  if (!value || value === '/') return '/';
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '/';
}

export function createQuizForgeConfig(input: QuizForgeConfigInput = {}): QuizForgeConfig {
  const env = import.meta.env;
  const apiMode = input.apiMode ?? (env.VITE_API_MODE === 'real' ? 'real' : 'mock');
  const apiBaseUrl = trimTrailingSlash(input.apiBaseUrl ?? env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1');
  const rawWsUrl = input.wsUrl ?? env.VITE_WS_URL;

  return {
    apiMode,
    apiBaseUrl,
    wsUrl: rawWsUrl ? trimTrailingSlash(rawWsUrl) : undefined,
    authProviderMode: input.authProviderMode ?? (env.VITE_AUTH_PROVIDER_MODE === 'host' ? 'host' : 'embedded'),
    basename: normalizeBasename(input.basename ?? env.VITE_ROUTING_BASENAME),
    accessToken: input.accessToken,
    onUnauthorized: input.onUnauthorized
  };
}
