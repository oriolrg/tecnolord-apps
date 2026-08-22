import Link from "next/link";
import { ArticleCard } from "@/components/biblioteca/article-card";
import { PublicNav } from "@/components/biblioteca/public-nav";
import { getPublishedArticles, getPublicTags, getPublicTopics } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const [articles, topics, tags] = await Promise.all([getPublishedArticles(), getPublicTopics(), getPublicTags()]);

  return (
    <>
      <PublicNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_280px]">
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-normal text-teal">Tecnolord</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal">Biblioteca</h1>
            <p className="mt-3 max-w-2xl text-slate-700">
              Documentacio, apunts, tutorials i referencies publicades per consulta rapida.
            </p>
          </div>
          <div className="grid gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {!articles.length ? <p className="rounded-md border border-line bg-white p-5">Encara no hi ha articles publicats.</p> : null}
          </div>
        </section>
        <aside className="space-y-6">
          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="font-semibold">Temes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/tema/${topic.slug}`} className="rounded border border-line px-2 py-1 text-sm hover:border-teal">
                  {topic.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="font-semibold">Etiquetes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/etiqueta/${tag.slug}`} className="rounded border border-line px-2 py-1 text-sm hover:border-teal">
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
