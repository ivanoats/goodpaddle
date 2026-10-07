import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { brotliCompressSync } from 'node:zlib';
import { load } from 'cheerio';

const root = resolve('dist');
async function walk(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      items.map((item) =>
        item.isDirectory() ? walk(join(dir, item.name)) : join(dir, item.name),
      ),
    )
  ).flat();
}
const files = await walk(root);
const pages = files.filter((file) => file.endsWith('.html'));
const documents = new Map(
  await Promise.all(
    pages.map(async (file) => [file, load(await readFile(file, 'utf8'))]),
  ),
);
for (const [file, $] of documents) {
  const label = relative(root, file);
  assert.equal($('h1').length, 1, `${label}: expected one h1`);
  assert.equal($('main').length, 1, `${label}: expected main landmark`);
  assert($('title').text().trim(), `${label}: missing title`);
  assert(
    $('meta[name="description"]').attr('content'),
    `${label}: missing description`,
  );
  assert(
    $('link[rel="canonical"]')
      .attr('href')
      ?.startsWith('https://www.goodpaddle.com/'),
    `${label}: missing canonical`,
  );
  $('img').each((_, image) =>
    assert($(image).attr('alt') !== undefined, `${label}: missing image alt`),
  );
  for (const element of $(
    'a[href], img[src], script[src], link[href]',
  ).toArray()) {
    const href = $(element).attr('href') ?? $(element).attr('src');
    assert(href && href !== '#', `${label}: placeholder link`);
    const url = new URL(
      href,
      `https://www.goodpaddle.com/${label.replace(/index\.html$/, '')}`,
    );
    if (url.origin !== 'https://www.goodpaddle.com') continue;
    let target = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    assert(
      target.startsWith(`${root}/`) || target === root,
      'Path must stay within dist',
    );
    const directoryIndex = join(target, 'index.html');
    if (files.includes(directoryIndex)) target = directoryIndex;
    assert(
      files.includes(target),
      `${label}: missing local asset or page ${href}`,
    );
    if (url.hash && documents.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(
        documents
          .get(target)('[id]')
          .toArray()
          .some((item) => documents.get(target)(item).attr('id') === id),
        `${label}: missing anchor ${href}`,
      );
    }
  }
}
// Budgets apply to emitted, compressed CSS/JS and modern hero assets, not archived source photos.
const bytes = async (suffixes) =>
  (
    await Promise.all(
      files
        .filter((file) => suffixes.some((suffix) => file.endsWith(suffix)))
        .map(
          async (file) => brotliCompressSync(await readFile(file)).byteLength,
        ),
    )
  ).reduce((a, b) => a + b, 0);
const css = await bytes(['.css']);
const js = await bytes(['.js']);
assert(css < 25 * 1024, `CSS exceeds 25 KiB: ${css}`);
assert(js < 15 * 1024, `JavaScript exceeds 15 KiB: ${js}`);
assert(
  !files.some((file) => /\.(woff2?|ttf|otf)$/.test(file)),
  'System fonts should require no font downloads',
);
assert(files.includes(join(root, '404.html')), 'Missing 404 document');
console.log(
  `Validated ${pages.length} pages; Brotli CSS ${(css / 1024).toFixed(1)} KiB, JS ${(js / 1024).toFixed(1)} KiB.`,
);
