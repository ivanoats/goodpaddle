interface Entry {
  id: string;
  data: { draft: boolean; navLabel?: string; navOrder?: number };
}

export function contentPath(id: string, kind: 'page' | 'post'): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(id)) {
    throw new Error(`Invalid content ID: ${id}`);
  }
  if (kind === 'post') return `/blog/${id}/`;
  if (
    ['blog', '404', 'index', 'assets', 'images', '_astro'].includes(
      id.split('/')[0],
    )
  ) {
    throw new Error(`Reserved page route: ${id}`);
  }
  return id === 'home' ? '/' : `/${id}/`;
}

export function pageRoutes<T extends Entry>(entries: T[]) {
  const seen = new Set<string>();
  return entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => {
      const path = contentPath(entry.id, 'page');
      if (seen.has(path)) throw new Error(`Duplicate route: ${path}`);
      seen.add(path);
      return { entry, path };
    });
}

export function navigation<T extends Entry>(entries: T[]) {
  return pageRoutes(entries)
    .filter(({ entry }) => entry.data.navLabel)
    .sort(
      (a, b) =>
        (a.entry.data.navOrder ?? 100) - (b.entry.data.navOrder ?? 100) ||
        a.path.localeCompare(b.path),
    )
    .map(({ entry, path }) => ({ label: entry.data.navLabel!, path }));
}

export function publishedPosts<T extends Entry & { data: { published: Date } }>(
  entries: T[],
) {
  const seen = new Set<string>();
  return entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => {
      const path = contentPath(entry.id, 'post');
      if (seen.has(path)) throw new Error(`Duplicate route: ${path}`);
      seen.add(path);
      return { entry, path };
    })
    .sort(
      (a, b) =>
        b.entry.data.published.getTime() - a.entry.data.published.getTime() ||
        a.path.localeCompare(b.path),
    );
}
