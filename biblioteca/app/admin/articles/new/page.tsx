import { ArticleForm } from "@/components/biblioteca/article-form";
import { AdminNav } from "@/components/biblioteca/admin-nav";
import { getCsrfToken, requireAdmin } from "@/lib/biblioteca/auth";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-semibold">Nou document</h1>
        <ArticleForm csrfToken={getCsrfToken()} />
      </main>
    </>
  );
}
