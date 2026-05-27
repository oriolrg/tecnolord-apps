import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entrenador personal",
  description: "Planificacio, registre i analisi d'entrenaments personals."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
