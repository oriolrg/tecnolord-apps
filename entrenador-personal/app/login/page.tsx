import Link from "next/link";
import { ArrowRight, Chrome } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[36px] bg-ink p-8 text-white shadow-soft lg:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Entrenador personal</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight lg:text-5xl">
            Planifica el mes, registra el que fas i replanifica sense improvisar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            App multiusuari preparada per Google OAuth, importacio de activitats i motor de recomanacions basat en regles.
          </p>
        </section>
        <Card className="flex flex-col justify-between rounded-[36px] p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pine">Acces</p>
            <h2 className="mt-3 text-3xl font-semibold">Entra amb Google</h2>
            <p className="mt-3 text-sm text-slate-600">
              Configura `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` i `NEXTAUTH_SECRET` per activar el login real.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <Link
              href="/api/auth/signin"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Chrome size={16} />
              Continuar amb Google
            </Link>
            <Link href="/dashboard" className="flex items-center justify-center gap-2 text-sm font-semibold text-pine">
              Obrir demo app
              <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
