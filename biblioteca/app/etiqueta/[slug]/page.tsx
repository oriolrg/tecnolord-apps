import { ArticleCard } from "@/components/biblioteca/article-card";
import { PublicNav } from "@/components/biblioteca/public-nav";
import { getArticlesByTag } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: { params: { slug: string } }) {
  const articles = await getArticlesByTag(params.slug);
  const title = articles[0]?.tags.find(({ tag }) => tag.slug === params.slug)?.tag.name ?? params.slug;

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-semibold">Etiqueta: #{title}</h1>
        <div className="grid gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {!articles.length ? <p>No hi ha articles publicats amb aquesta etiqueta.</p> : null}
        </div>
      </main>
    </>
  );
}
