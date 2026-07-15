import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { buildProxyUrl } from './App';
import App from './App';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    text: () => Promise.resolve('<xml />'),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('builds a same-origin proxy URL for the EPG feed', () => {
  const url = buildProxyUrl('https://example.com/data.json');

  expect(url).toContain('/api/proxy?url=https%3A%2F%2Fexample.com%2Fdata.json');
});

test('does not warn about returning a promise from useEffect', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(<App />);
  await Promise.resolve();

  const warned = consoleErrorSpy.mock.calls.some((args) =>
    String(args[0]).includes('useEffect must not return anything besides a function')
  );

  expect(warned).toBe(false);
  consoleErrorSpy.mockRestore();
});
