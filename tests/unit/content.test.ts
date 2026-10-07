import { expect, test } from 'vitest';
import { pageRoutes, navigation, publishedPosts } from '../../src/lib/content';
test('publishes home at root and hides draft pages', () => {
  const entries = [
    { id: 'home', data: { draft: false } },
    { id: 'contact', data: { draft: true } },
    { id: 'about', data: { draft: false } },
  ];
  expect(pageRoutes(entries).map(({ path }) => path)).toEqual(['/', '/about/']);
});

test.each([
  'blog',
  'blog/first',
  '404',
  'index',
  'assets',
  'images',
  '_astro',
  '../escape',
  'About',
  'two words',
  'double//slash',
  '',
])('rejects unsafe or reserved page ID %s', (id) => {
  expect(() => pageRoutes([{ id, data: { draft: false } }])).toThrow();
});
test('rejects duplicate published page routes', () => {
  expect(() =>
    pageRoutes([
      { id: 'about', data: { draft: false } },
      { id: 'about', data: { draft: false } },
    ]),
  ).toThrow('Duplicate route');
});

test('navigation hides drafts and unlisted pages and sorts by order then path', () => {
  const entries = [
    { id: 'contact', data: { draft: false, navLabel: 'Contact' } },
    { id: 'hidden', data: { draft: true, navLabel: 'Hidden', navOrder: -1 } },
    { id: 'legal', data: { draft: false } },
    { id: 'about', data: { draft: false, navLabel: 'About' } },
    { id: 'home', data: { draft: false, navLabel: 'Home', navOrder: 0 } },
  ];
  expect(navigation(entries)).toEqual([
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about/' },
    { label: 'Contact', path: '/contact/' },
  ]);
});

test('posts publish newest first with stable ordering and no drafts', () => {
  const post = (id: string, date: string, draft = false) => ({
    id,
    data: { published: new Date(date), draft },
  });
  const entries = [
    post('older', '2025-01-01'),
    post('private', '2027-01-01', true),
    post('b', '2026-01-01'),
    post('a', '2026-01-01'),
  ];
  expect(publishedPosts(entries).map(({ path }) => path)).toEqual([
    '/blog/a/',
    '/blog/b/',
    '/blog/older/',
  ]);
  expect(entries[0].id).toBe('older');
});

test('duplicate blog URLs fail instead of overwriting a post', () => {
  const post = {
    id: 'trip',
    data: { draft: false, published: new Date('2026-01-01') },
  };
  expect(() => publishedPosts([post, post])).toThrow('Duplicate route');
});
