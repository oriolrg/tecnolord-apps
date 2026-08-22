import { ArticleCard } from "@/components/biblioteca/article-card";
import { PublicNav } from "@/components/biblioteca/public-nav";
import { searchPublishedArticles } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? "";
  const results = await searchPublishedArticles(query);

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Cercador</h1>
        <form className="mt-5 flex gap-2" action="/biblioteca/cerca">
          <input className="field" name="q" defaultValue={query} placeholder="Titol, contingut, paraula clau o etiqueta" />
          <button className="rounded-md bg-teal px-4 py-2 font-semibold text-white">Cercar</button>
        </form>
        <div className="mt-6 grid gap-4">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {query && !results.length ? <p>No s'ha trobat cap resultat publicat.</p> : null}
        </div>
      </main>
    </>
  );
}
