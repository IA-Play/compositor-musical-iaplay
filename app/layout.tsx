import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://canalnoalvo.com"),
  title: "NoAlvo Platform",
  description: "Portal oficial do canal NoAlvo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        <main className="container-pad py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
