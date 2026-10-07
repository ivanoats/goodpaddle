import { fileURLToPath } from 'node:url';
import { copyFile } from 'node:fs/promises';
await copyFile(
  fileURLToPath(
    import.meta.resolve('@sustainablewebsites/verdant-design/theme-toggle.js'),
  ),
  'public/verdant-theme-toggle.js',
);
