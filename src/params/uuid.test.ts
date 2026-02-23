import { describe, expect, it } from 'vitest';
import { match } from './uuid';

describe('uuid param matcher', () => {
  it('accepts valid UUIDs', () => {
    expect(match('8df96a0e-0b0b-4eb7-9f9e-64fa7798ca41')).toBe(true);
    expect(match('8DF96A0E-0B0B-4EB7-9F9E-64FA7798CA41')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(match('123')).toBe(false);
    expect(match('not-a-uuid')).toBe(false);
    expect(match('8df96a0e0b0b4eb79f9e64fa7798ca41')).toBe(false);
  });
});

