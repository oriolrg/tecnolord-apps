import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { slugify } from "./slug";
import type { articleSchema } from "./validation";
import type { z } from "zod";

export const articleInclude = {
  topic: true,
  tags: { include: { tag: true } },
  sources: true,
  attachments: true
} satisfies Prisma.ArticleInclude;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export async function getPublishedArticles(limit = 24) {
  return prisma.article.findMany({
    where: { status: "published" },
    include: articleInclude,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit
  });
}

export async function getPublishedArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "published" },
    include: articleInclude
  });
}

export async function getAdminArticles() {
  return prisma.article.findMany({
    include: articleInclude,
    orderBy: { updatedAt: "desc" }
  });
}

export async function getAdminArticle(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: articleInclude
  });
}

export async function getPublicTopics() {
  return prisma.topic.findMany({
    where: { articles: { some: { status: "published" } } },
    orderBy: { name: "asc" }
  });
}

export async function getPublicTags() {
  return prisma.tag.findMany({
    where: { articles: { some: { article: { status: "published" } } } },
    orderBy: { name: "asc" }
  });
}

export async function getArticlesByTopic(slug: string) {
  return prisma.article.findMany({
    where: { status: "published", topic: { slug } },
    include: articleInclude,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }]
  });
}

export async function getArticlesByTag(slug: string) {
  return prisma.article.findMany({
    where: { status: "published", tags: { some: { tag: { slug } } } },
    include: articleInclude,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }]
  });
}

export async function searchPublishedArticles(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const matches = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id"
    FROM "biblioteca"."Article"
    WHERE "status" = 'published'
      AND to_tsvector(
        'simple',
        coalesce("title", '') || ' ' ||
        coalesce("summary", '') || ' ' ||
        coalesce("contentMarkdown", '') || ' ' ||
        coalesce(array_to_string("keywords", ' '), '')
      ) @@ plainto_tsquery('simple', ${trimmed})
    ORDER BY ts_rank(
      to_tsvector(
        'simple',
        coalesce("title", '') || ' ' ||
        coalesce("summary", '') || ' ' ||
        coalesce("contentMarkdown", '') || ' ' ||
        coalesce(array_to_string("keywords", ' '), '')
      ),
      plainto_tsquery('simple', ${trimmed})
    ) DESC
    LIMIT 50
  `;
  const ids = matches.map((match) => match.id);

  return prisma.article.findMany({
    where: {
      status: "published",
      OR: [
        { id: { in: ids } },
        { title: { contains: trimmed, mode: "insensitive" } },
        { summary: { contains: trimmed, mode: "insensitive" } },
        { keywords: { has: trimmed } },
        { tags: { some: { tag: { name: { contains: trimmed, mode: "insensitive" } } } } }
      ]
    },
    include: articleInclude,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 50
  });
}

type ArticleInput = z.infer<typeof articleSchema> & { slug: string };

async function ensureTopic(name: string) {
  return prisma.topic.upsert({
    where: { slug: slugify(name) },
    update: { name },
    create: { name, slug: slugify(name) }
  });
}

async function ensureTags(tags: string[]) {
  return Promise.all(
    tags.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) }
      })
    )
  );
}

function toDate(value?: string) {
  return value ? new Date(value) : null;
}

export async function createArticle(input: ArticleInput, authorId: string) {
  const topic = await ensureTopic(input.topicName);
  const tags = await ensureTags(input.tags);
  const publishedAt =
    input.status === "published" ? toDate(input.publishedAt) ?? new Date() : toDate(input.publishedAt);

  return prisma.article.create({
    data: {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      contentMarkdown: input.contentMarkdown,
      status: input.status,
      verificationStatus: input.verificationStatus,
      scope: input.scope,
      keywords: input.keywords,
      createdWithAi: input.createdWithAi,
      reviewedAt: toDate(input.reviewedAt),
      publishedAt,
      authorId,
      topicId: topic.id,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id }))
      },
      sources: {
        create: input.sources.map((source) => ({
          title: source.title,
          url: source.url || null,
          note: source.note || null
        }))
      }
    }
  });
}

export async function updateArticle(id: string, input: ArticleInput) {
  const topic = await ensureTopic(input.topicName);
  const tags = await ensureTags(input.tags);
  const current = await prisma.article.findUniqueOrThrow({ where: { id } });
  const publishedAt =
    input.status === "published" && !current.publishedAt
      ? toDate(input.publishedAt) ?? new Date()
      : toDate(input.publishedAt);

  return prisma.$transaction([
    prisma.articleTag.deleteMany({ where: { articleId: id } }),
    prisma.source.deleteMany({ where: { articleId: id } }),
    prisma.article.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        contentMarkdown: input.contentMarkdown,
        status: input.status,
        verificationStatus: input.verificationStatus,
        scope: input.scope,
        keywords: input.keywords,
        createdWithAi: input.createdWithAi,
        reviewedAt: toDate(input.reviewedAt),
        publishedAt,
        topicId: topic.id,
        tags: {
          create: tags.map((tag) => ({ tagId: tag.id }))
        },
        sources: {
          create: input.sources.map((source) => ({
            title: source.title,
            url: source.url || null,
            note: source.note || null
          }))
        }
      }
    })
  ]);
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}
