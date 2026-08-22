export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form action="/biblioteca/api/admin/login" method="post" className="w-full rounded-md border border-line bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-semibold">Acces privat</h1>
        <p className="mt-2 text-sm text-slate-600">Administracio de la Biblioteca Tecnolord.</p>
        {searchParams.error ? <p className="mt-4 rounded-md border border-brick bg-brick/10 p-3 text-sm text-brick">Credencials incorrectes.</p> : null}
        <div className="mt-5 space-y-4">
          <label className="space-y-1">
            <span className="label">Email</span>
            <input className="field" name="email" type="email" required />
          </label>
          <label className="space-y-1">
            <span className="label">Contrasenya</span>
            <input className="field" name="password" type="password" required />
          </label>
          <button className="w-full rounded-md bg-teal px-4 py-2 font-semibold text-white hover:bg-teal/90">Entrar</button>
        </div>
      </form>
    </main>
  );
}
