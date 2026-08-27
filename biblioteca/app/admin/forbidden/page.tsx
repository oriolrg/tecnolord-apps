export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <section className="w-full rounded-md border border-line bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-semibold">Acces denegat</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Aquest compte no te permisos d'administracio per accedir a la Biblioteca.
        </p>
      </section>
    </main>
  );
}
