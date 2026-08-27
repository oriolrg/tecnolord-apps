import Link from "next/link";
import { format } from "date-fns";
import { AdminNav } from "@/components/biblioteca/admin-nav";
import { requireAdminPage } from "@/lib/biblioteca/auth";
import { getAdminArticles } from "@/lib/biblioteca/repository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminPage();
  const articles = await getAdminArticles();

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Documents</h1>
            <p className="text-sm text-slate-600">Crear, editar, publicar, arxivar o despublicar sense eliminar.</p>
          </div>
          <Link href="/admin/articles/new" className="rounded-md bg-teal px-4 py-2 font-semibold text-white">
            Nou document
          </Link>
        </div>
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Titol</th>
                <th className="px-4 py-3">Tema</th>
                <th className="px-4 py-3">Estat</th>
                <th className="px-4 py-3">Verificacio</th>
                <th className="px-4 py-3">Actualitzat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-4 py-3">
                    <Link className="font-semibold text-teal" href={`/admin/articles/${article.id}`}>
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{article.topic.name}</td>
                  <td className="px-4 py-3">{article.status}</td>
                  <td className="px-4 py-3">{article.verificationStatus}</td>
                  <td className="px-4 py-3">{format(article.updatedAt, "dd/MM/yyyy HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
