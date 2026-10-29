import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vaquinha | Financiamento coletivo",
  description:
    "Crie sua campanha, compartilhe sua história e receba apoio para sua causa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
