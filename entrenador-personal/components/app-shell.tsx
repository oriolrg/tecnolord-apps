import Link from "next/link";
import type { PropsWithChildren } from "react";
import { CalendarDays, Dumbbell, FileUp, Home, Settings, TrendingUp, Upload } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/calendar", label: "Calendari", icon: CalendarDays },
  { href: "/week", label: "Setmana", icon: TrendingUp },
  { href: "/weekly-summary", label: "Resum", icon: TrendingUp },
  { href: "/exercises", label: "Exercicis", icon: Dumbbell },
  { href: "/import-plan", label: "Importar pla", icon: FileUp },
  { href: "/import-activity", label: "Importar activitat", icon: Upload },
  { href: "/settings", label: "Configuracio", icon: Settings }
] as const;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <aside className="hidden w-72 shrink-0 rounded-[32px] bg-ink px-6 py-8 text-white lg:block">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Entrenador personal</p>
          <h1 className="text-2xl font-semibold">Pla viu i registre diari</h1>
        </div>
        <nav className="mt-10 space-y-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  );
}
