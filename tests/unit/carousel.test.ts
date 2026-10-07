import { describe, expect, it } from 'vitest';
import { selectSlides, swipeDirection } from '../../src/lib/carousel';

describe('carousel selection', () => {
  const pool = Array.from({ length: 11 }, (_, i) => `photo-${i}`);
  it('keeps the lead photo and chooses five distinct photos from the pool', () => {
    const result = selectSlides('lead', pool, () => 0.4);
    expect(result).toHaveLength(6);
    expect(result[0]).toBe('lead');
    expect(new Set(result).size).toBe(6);
    expect(result.slice(1).every((item) => pool.includes(item))).toBe(true);
    expect(pool).toEqual(Array.from({ length: 11 }, (_, i) => `photo-${i}`));
  });
  it('resamples on a new initialization', () => {
    expect(selectSlides('lead', pool, () => 0)).not.toEqual(
      selectSlides('lead', pool, () => 0.99),
    );
  });
  it('handles small pools and excludes duplicates including the first photo', () => {
    expect(selectSlides('lead', ['lead', 'a', 'a'], () => 0)).toEqual([
      'lead',
      'a',
    ]);
    expect(selectSlides('lead', [])).toEqual(['lead']);
    expect(selectSlides('lead', ['a'])).toEqual(['lead', 'a']);
  });
});

describe('swipe gestures', () => {
  it.each([
    [-80, 5, 1],
    [80, 5, -1],
    [-50, 0, 1],
    [49, 0, 0],
    [0, 80, 0],
    [80, 100, 0],
    [-80, -80, 0],
  ])('maps (%i, %i) to direction %i', (dx, dy, direction) => {
    expect(swipeDirection(dx, dy)).toBe(direction);
  });
});
