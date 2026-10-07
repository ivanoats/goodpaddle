import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const assets = new URL('../src/assets/', import.meta.url);
const photos = JSON.parse(
  await readFile(new URL('carousel-photos.json', assets), 'utf8'),
);
await mkdir(new URL('optimized/', assets), { recursive: true });
for (const { file, name, focus } of photos) {
  const source = sharp(
    fileURLToPath(new URL(`fullsize/${file}`, assets)),
  ).autoOrient();
  const { width, height } = await source.metadata();
  const cropWidth = Math.min(width, Math.floor((height * 4) / 3));
  const cropHeight = Math.min(height, Math.floor((width * 3) / 4));
  const left = Math.max(
    0,
    Math.min(width - cropWidth, Math.round(width * focus[0] - cropWidth / 2)),
  );
  const top = Math.max(
    0,
    Math.min(
      height - cropHeight,
      Math.round(height * focus[1] - cropHeight / 2),
    ),
  );
  const result = await source
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize({
      width: 1200,
      height: 900,
      fit: 'cover',
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 6 })
    .toFile(fileURLToPath(new URL(`optimized/${name}.webp`, assets)));
  console.log(
    `${name}: ${result.width}×${result.height}, ${(result.size / 1024).toFixed(0)} KiB`,
  );
}
