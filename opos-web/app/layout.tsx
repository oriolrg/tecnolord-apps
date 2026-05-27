import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opos Web",
  description: "App d'estudi i simulacres per a oposicions TIC."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
