import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    series: z.string().optional(),
    prev: z.string().optional(),
    next: z.string().optional(),
  }),
});

const javaNetworkSeries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    series: z.string(),
    prev: z.string().nullable().optional(),
    next: z.string().nullable().optional(),
  }),
});

const javascriptNetworkSeries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    series: z.string(),
    prev: z.string().nullable().optional(),
    next: z.string().nullable().optional(),
  }),
});

export const collections = {
  'posts': posts,
  'java-network-series': javaNetworkSeries,
  'javascript-network-series': javascriptNetworkSeries,
};
