import { expect, test } from 'vitest';
import { buildProxyUrl } from './App';

test('builds a same-origin proxy URL for the EPG feed', () => {
  const url = buildProxyUrl('https://example.com/data.json');

  expect(url).toContain('/api/proxy?url=https%3A%2F%2Fexample.com%2Fdata.json');
});
