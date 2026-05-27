import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn("rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-soft backdrop-blur", className)}>
      {children}
    </section>
  );
}
