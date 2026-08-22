import { z } from "zod";
import { slugify } from "./slug";

export const articleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  summary: z.string().min(8),
  contentMarkdown: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]),
  topicName: z.string().min(2),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  sources: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url().optional().or(z.literal("")),
        note: z.string().optional()
      })
    )
    .default([]),
  createdWithAi: z.boolean().default(false),
  verificationStatus: z.enum(["pending", "reviewed", "verified"]),
  scope: z.enum(["notes", "tutorial", "project", "regulation", "opinion"]),
  reviewedAt: z.string().optional().or(z.literal("")),
  publishedAt: z.string().optional().or(z.literal(""))
});

export function normalizeArticleInput(input: z.infer<typeof articleSchema>) {
  return {
    ...input,
    slug: slugify(input.slug || input.title),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    keywords: input.keywords.map((keyword) => keyword.trim()).filter(Boolean),
    sources: input.sources.filter((source) => source.title.trim())
  };
}
