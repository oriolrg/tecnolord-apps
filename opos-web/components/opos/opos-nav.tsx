import Link from "next/link";
import { BarChart3, BookOpen, Brain, FileUp, History, Home, Medal, Settings, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/opos", label: "Dashboard", icon: Home },
  { href: "/opos/import", label: "Importar", icon: FileUp },
  { href: "/opos/imports", label: "Importacions", icon: History },
  { href: "/opos/questions", label: "Preguntes", icon: BookOpen },
  { href: "/opos/tests/new", label: "Tests", icon: Brain },
  { href: "/opos/mock-exams", label: "Simulacres", icon: Timer },
  { href: "/opos/analytics", label: "Analitica", icon: BarChart3 },
  { href: "/opos/progress", label: "Progres", icon: Medal },
  { href: "/opos/settings", label: "Configuracio", icon: Settings }
] as const;

export function OposNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="overflow-x-auto">
      <div className="flex min-w-max gap-2 rounded-[28px] border border-white/60 bg-white/80 p-2 shadow-soft backdrop-blur">
        {items.map(({ href, label, icon: Icon }) => {
          const active = currentPath === href || currentPath.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                active ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
