export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 lg:px-6">{children}</div>;
}
