import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind-safe className combiner.
 * Uses `clsx` to conditionally build a class string, then `twMerge` to dedupe/conflict-resolve Tailwind utilities.
 * Handy for composing variants without ending up with `p-2 p-4`-style collisions.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Capitalizes only the first character of a string.
 * Returns the original value for empty strings, keeping the function safe for optional/blank input.
 * Examples:
 * - capitalize('hello') => 'Hello'
 * - capitalize('titles') => 'Titles'
 * - capitalize('') => ''
 */
export const capitalize = (s: string) =>
  s ? s[0]?.toUpperCase() + s.slice(1) : s;

/**
 * Converts identifiers into human-readable labels.
 * Handles camelCase (adds spaces), snake_case/kebab-case (replaces separators), normalizes whitespace, and Title-Cases words.
 * Useful for turning job/feature keys into UI-friendly text.
 * Examples:
 * - humanize('socialPosts') => 'Social Posts'
 * - humanize('hello_world') => 'Hello World'
 * - humanize('youtube-timestamps') => 'Youtube Timestamps'
 * - humanize('  multiple   spaces_here ') => 'Multiple Spaces Here'
 */
export const humanize = (s: string) =>
  s
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
