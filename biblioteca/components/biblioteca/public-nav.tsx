import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

export function PublicNav() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <BookOpen className="h-5 w-5 text-teal" aria-hidden="true" />
          Biblioteca Tecnolord
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cerca" className="flex items-center gap-1 text-slate-700 hover:text-teal">
            <Search className="h-4 w-4" aria-hidden="true" />
            Cerca
          </Link>
          <Link href="/admin" className="text-slate-700 hover:text-teal">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
