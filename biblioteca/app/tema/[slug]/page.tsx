import { ArticleCard } from "@/components/biblioteca/article-card";
import { PublicNav } from "@/components/biblioteca/public-nav";
import { getArticlesByTopic } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const articles = await getArticlesByTopic(params.slug);
  const title = articles[0]?.topic.name ?? params.slug;

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-semibold">Tema: {title}</h1>
        <div className="grid gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {!articles.length ? <p>No hi ha articles publicats en aquest tema.</p> : null}
        </div>
      </main>
    </>
  );
}
