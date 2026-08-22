import Link from "next/link";
import { FilePlus, Library, LogOut } from "lucide-react";
import { getCsrfToken } from "@/lib/biblioteca/auth";

export function AdminNav() {
  const csrfToken = getCsrfToken();

  return (
    <header className="border-b border-line bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Library className="h-5 w-5 text-brass" aria-hidden="true" />
          Admin biblioteca
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 rounded-md bg-teal px-3 py-2 font-semibold hover:bg-teal/90"
          >
            <FilePlus className="h-4 w-4" aria-hidden="true" />
            Nou article
          </Link>
          <form action="/biblioteca/api/admin/logout" method="post">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <button className="flex items-center gap-2 rounded-md border border-white/25 px-3 py-2 hover:bg-white/10">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sortir
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
