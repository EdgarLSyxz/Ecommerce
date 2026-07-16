import { describe, expect, it } from 'vitest';
import { parsePositiveIntId } from './queries';

describe('parsePositiveIntId', () => {
  it('devuelve null para ids no numéricos', () => {
    expect(parsePositiveIntId('abc')).toBeNull();
    expect(parsePositiveIntId('')).toBeNull();
  });

  it('devuelve null para ids no positivos', () => {
    expect(parsePositiveIntId('0')).toBeNull();
    expect(parsePositiveIntId('-5')).toBeNull();
    expect(parsePositiveIntId('1.5')).toBeNull();
  });

  it('devuelve el número para ids válidos', () => {
    expect(parsePositiveIntId('1')).toBe(1);
    expect(parsePositiveIntId('42')).toBe(42);
  });
});
