import Link from "next/link";
import { format } from "date-fns";
import type { ArticleWithRelations } from "@/lib/biblioteca/repository";

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  const cover = article.attachments.find((attachment) => attachment.kind === "cover");

  return (
    <article className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_132px]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <Link href={`/tema/${article.topic.slug}`} className="font-semibold text-teal">
            {article.topic.name}
          </Link>
          <span>{format(article.publishedAt ?? article.updatedAt, "dd/MM/yyyy")}</span>
          {article.createdWithAi ? <span className="text-brass">Assistit amb IA</span> : null}
        </div>
        <h2 className="text-xl font-semibold">
          <Link href={`/article/${article.slug}`} className="hover:text-teal">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{article.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/etiqueta/${tag.slug}`}
              className="rounded border border-line px-2 py-1 text-xs text-slate-700 hover:border-teal hover:text-teal"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
      {cover ? <img src={cover.url} alt={cover.altText || ""} className="h-28 w-full rounded-md object-cover sm:h-full" /> : null}
    </article>
  );
}
