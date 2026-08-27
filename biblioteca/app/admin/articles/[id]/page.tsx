import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/biblioteca/article-form";
import { AdminNav } from "@/components/biblioteca/admin-nav";
import { getCsrfToken, requireAdminPage } from "@/lib/biblioteca/auth";
import { getAdminArticle } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  await requireAdminPage();
  const article = await getAdminArticle(params.id);
  if (!article) notFound();

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-semibold">Editar document</h1>
        <ArticleForm article={article} csrfToken={getCsrfToken()} />
      </main>
    </>
  );
}
