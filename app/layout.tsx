import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vaquinha — Sua causa merece ser ouvida",
    template: "%s | Vaquinha",
  },
  description:
    "Crie uma campanha, conte sua história e reúna pessoas para transformar uma causa em realidade.",
  applicationName: "Vaquinha",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
