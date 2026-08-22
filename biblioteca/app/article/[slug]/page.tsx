import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MarkdownView } from "@/components/biblioteca/markdown-view";
import { PublicNav } from "@/components/biblioteca/public-nav";
import { getPublishedArticle } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getPublishedArticle(params.slug);
  if (!article) notFound();

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 text-sm text-slate-600">
          <Link href={`/tema/${article.topic.slug}`} className="font-semibold text-teal">
            {article.topic.name}
          </Link>
          <span> · {format(article.publishedAt ?? article.updatedAt, "dd/MM/yyyy")}</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-normal">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">{article.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded border border-line px-2 py-1 text-xs text-slate-700">{article.scope}</span>
          <span className="rounded border border-line px-2 py-1 text-xs text-slate-700">{article.verificationStatus}</span>
          {article.createdWithAi ? <span className="rounded border border-brass px-2 py-1 text-xs text-brass">Assistit amb IA</span> : null}
        </div>
        <article className="mt-8 border-t border-line pt-6">
          <MarkdownView content={article.contentMarkdown} />
        </article>
        {article.sources.length ? (
          <section className="mt-10 rounded-md border border-line bg-white p-5">
            <h2 className="font-semibold">Fonts i referencies</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {article.sources.map((source) => (
                <li key={source.id}>
                  {source.url ? (
                    <a href={source.url} className="font-semibold text-teal" rel="noreferrer" target="_blank">
                      {source.title}
                    </a>
                  ) : (
                    <span className="font-semibold">{source.title}</span>
                  )}
                  {source.note ? <span className="text-slate-600"> · {source.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
