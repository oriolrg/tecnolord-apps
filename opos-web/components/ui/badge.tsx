import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  partial: "bg-sky-100 text-sky-800",
  skipped: "bg-rose-100 text-rose-800",
  substituted: "bg-violet-100 text-violet-800",
  rest: "bg-stone-200 text-stone-700",
  strength: "bg-coral/20 text-coral",
  outdoor: "bg-moss/20 text-pine",
  intensity: "bg-ink/10 text-ink",
  mobility: "bg-sand text-amber-900"
};

export function Badge({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", tones[tone] ?? "bg-slate-100 text-slate-700")}>
      {label}
    </span>
  );
}
