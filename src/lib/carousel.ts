/** Keep the lead photo and sample up to five others without replacement. */
export function selectSlides<T>(
  first: T,
  pool: readonly T[],
  random = Math.random,
): T[] {
  const remaining = [...new Set(pool)].filter((item) => item !== first);
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  return [first, ...remaining.slice(0, 5)];
}

/** Ignore taps and primarily vertical gestures so normal scrolling still works. */
export function swipeDirection(dx: number, dy: number): number {
  if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}
