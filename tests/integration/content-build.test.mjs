import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  cp,
  symlink,
  writeFile,
  readFile,
  rm,
  access,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

test('Markdown publishes pages and posts, excludes drafts, and rejects invalid content', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'goodpaddle-content-'));
  const build = () =>
    execFileSync(
      process.execPath,
      [resolve('node_modules/astro/bin/astro.mjs'), 'build'],
      {
        cwd: fixture,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
        stdio: 'pipe',
      },
    );
  try {
    for (const path of [
      'src',
      'public',
      'styled-system',
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      'panda.config.ts',
      'postcss.config.cjs',
    ]) {
      await cp(resolve(path), join(fixture, path), { recursive: true });
    }
    await symlink(
      resolve('node_modules'),
      join(fixture, 'node_modules'),
      'dir',
    );
    // Own every fixture: publishing real site content must not invalidate this test.
    await rm(join(fixture, 'src/content'), { recursive: true });
    await mkdir(join(fixture, 'src/content/pages'), { recursive: true });
    await mkdir(join(fixture, 'src/content/posts'), { recursive: true });
    await writeFile(
      join(fixture, 'src/content/pages/home.md'),
      '---\ntitle: Fixture home\ndescription: Home for the content tests.\nnavLabel: Home\n---\n\nA home page.\n',
    );
    await writeFile(
      join(fixture, 'src/content/pages/private-page.md'),
      '---\ntitle: Private page\ndescription: Must remain unpublished.\ndraft: true\nnavLabel: Private page\n---\n',
    );
    await writeFile(
      join(fixture, 'src/content/posts/private-post.md'),
      '---\ntitle: Private post\ndescription: Must remain unpublished.\npublished: 2026-01-01\ndraft: true\n---\n',
    );
    await writeFile(
      join(fixture, 'src/content/pages/field-notes.md'),
      '---\ntitle: Field notes\ndescription: Published fixture.\nnavLabel: Field notes\n---\n\n## Shoreline notes\n\nA Markdown page.\n',
    );
    await writeFile(
      join(fixture, 'src/content/posts/first-trip.md'),
      '---\ntitle: First trip\ndescription: A published post.\npublished: 2026-01-01\n---\n\n## The trip\n\nA Markdown post.\n',
    );
    build();
    const page = await readFile(
      join(fixture, 'dist/field-notes/index.html'),
      'utf8',
    );
    assert.match(page, /Shoreline notes/);
    assert.match(page, /rel="mask-icon"[^>]*href="\/safari-pinned-tab\.svg"/);
    const blog = await readFile(join(fixture, 'dist/blog/index.html'), 'utf8');
    assert.match(blog, /href="\/blog\/first-trip\/"/);
    const post = await readFile(
      join(fixture, 'dist/blog/first-trip/index.html'),
      'utf8',
    );
    assert.match(post, /A Markdown post/);
    const sitemap = await readFile(join(fixture, 'dist/sitemap-0.xml'), 'utf8');
    assert.match(sitemap, /\/field-notes\//);
    assert.match(sitemap, /\/blog\/first-trip\//);
    assert.doesNotMatch(sitemap, /\/private-page\/|\/private-post\/|\/404/);
    await assert.rejects(access(join(fixture, 'dist/private-page/index.html')));
    await assert.rejects(
      access(join(fixture, 'dist/blog/private-post/index.html')),
    );

    const reserved = join(fixture, 'src/content/pages/blog.md');
    await writeFile(
      reserved,
      '---\ntitle: Collision\ndescription: Must fail.\n---\n',
    );
    assert.throws(build, /Reserved page route/);
    await rm(reserved);
    await writeFile(
      join(fixture, 'src/content/pages/invalid.md'),
      '---\ndescription: Missing a required title.\n---\n',
    );
    assert.throws(build, /title/);
    await rm(join(fixture, 'src/content/pages/invalid.md'));
    await writeFile(
      join(fixture, 'src/content/pages/invalid-nav-label.md'),
      '---\ntitle: Invalid navigation label\ndescription: Must fail.\nnavLabel: "   "\n---\n',
    );
    assert.throws(build, /navLabel/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
