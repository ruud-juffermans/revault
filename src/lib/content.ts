import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { routing, type Locale } from "@/i18n/routing";

const contentDir = path.join(process.cwd(), "content");
const DEFAULT_LOCALE = routing.defaultLocale;

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
}

function estimateReadingTime(content: string): string {
  const minutes = Math.ceil(content.split(/\s+/).length / 200);
  return `${minutes} min`;
}

function listSlugs(locale: Locale): string[] {
  const dir = path.join(contentDir, "blog", locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

function resolveFile(locale: Locale, slug: string) {
  const primary = path.join(contentDir, "blog", locale, `${slug}.mdx`);
  if (fs.existsSync(primary)) return { filePath: primary, usedFallback: false };
  if (locale !== DEFAULT_LOCALE) {
    const fallback = path.join(contentDir, "blog", DEFAULT_LOCALE, `${slug}.mdx`);
    if (fs.existsSync(fallback)) return { filePath: fallback, usedFallback: true };
  }
  return null;
}

function metaFrom(slug: string, data: Record<string, unknown>, content: string): PostMeta {
  return {
    slug,
    title: (data.title as string) || "Untitled",
    date: (data.date as string) || "",
    excerpt: (data.excerpt as string) || "",
    tags: (data.tags as string[]) || [],
    readingTime: estimateReadingTime(content),
  };
}

export function getBlogPosts(locale: Locale = DEFAULT_LOCALE): PostMeta[] {
  const slugs = Array.from(new Set([...listSlugs(locale), ...listSlugs(DEFAULT_LOCALE)]));
  return slugs
    .map((slug) => {
      const resolved = resolveFile(locale, slug);
      if (!resolved) return null;
      const { data, content } = matter(fs.readFileSync(resolved.filePath, "utf-8"));
      return metaFrom(slug, data, content);
    })
    .filter((p): p is PostMeta => p !== null)
    .filter((p) => !p.date || new Date(p.date).getTime() <= Date.now())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(locale: Locale, slug: string) {
  const resolved = resolveFile(locale, slug);
  if (!resolved) return null;
  const { data, content } = matter(fs.readFileSync(resolved.filePath, "utf-8"));
  return { meta: metaFrom(slug, data, content), content, usedFallback: resolved.usedFallback };
}
