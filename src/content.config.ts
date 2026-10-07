import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const shared = {
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  draft: z.boolean().default(false),
};
export const collections = {
  pages: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
      base: './src/content/pages',
    }),
    schema: ({ image }) =>
      z.object({
        ...shared,
        hero: z
          .object({ image: image(), alt: z.string().trim().min(1) })
          .optional(),
        navLabel: z.string().trim().min(1).optional(),
        navOrder: z.number().optional(),
        eyebrow: z.string().optional(),
      }),
  }),
  posts: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
      base: './src/content/posts',
    }),
    schema: z.object({ ...shared, published: z.coerce.date() }),
  }),
};
