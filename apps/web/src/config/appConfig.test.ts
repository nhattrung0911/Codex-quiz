import { describe, expect, it } from 'vitest';
import { createQuizForgeConfig } from './appConfig';

describe('createQuizForgeConfig', () => {
  it('normalizes embed configuration and routing basename', () => {
    const config = createQuizForgeConfig({
      apiMode: 'real',
      apiBaseUrl: 'https://api.example.com/api/v1/',
      wsUrl: 'wss://api.example.com/ws/',
      authProviderMode: 'host',
      basename: 'quiz'
    });

    expect(config.apiMode).toBe('real');
    expect(config.apiBaseUrl).toBe('https://api.example.com/api/v1');
    expect(config.wsUrl).toBe('wss://api.example.com/ws');
    expect(config.authProviderMode).toBe('host');
    expect(config.basename).toBe('/quiz');
  });
});
