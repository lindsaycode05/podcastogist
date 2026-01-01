/**
 * Public demo queries
 *
 * Exposes read-only access to curated demo projects flagged in the DB.
 */
import { v } from 'convex/values';
import { query } from './_generated/server';

export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_demo_order', (q) => q.eq('isDemo', true))
      .collect();

    const visible = projects.filter((project) => !project.deletedAt);

    return visible.sort((a, b) => {
      const orderA = a.demoOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.demoOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
      return a.fileName.localeCompare(b.fileName);
    });
  }
});

export const getProjectBySlug = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query('projects')
      .withIndex('by_demo_slug', (q) =>
        q.eq('demoSlug', args.slug).eq('isDemo', true)
      )
      .first();

    if (!project || project.deletedAt) {
      return null;
    }

    return project;
  }
});
