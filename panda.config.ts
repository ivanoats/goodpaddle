import { defineConfig } from '@pandacss/dev';
import { verdantPreset } from '@sustainablewebsites/verdant-design';
export default defineConfig({
  preflight: true,
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda', verdantPreset],
  include: ['./src/**/*.{ts,astro}'],
  outdir: 'styled-system',
});
