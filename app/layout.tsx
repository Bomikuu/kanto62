import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { PublicHeader } from "./site-nav";
import "./style.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.KANTO62_WEB_ORIGIN || "http://localhost:3063",
  ),
  title: {
    default: "kanto62 · Davao City directory",
    template: "%s · kanto62",
  },
  description:
    "Discover neighborhood shops, eateries and repair services in Davao City.",
  robots: {
    index:
      process.env.KANTO62_INDEX_PUBLIC === "1" &&
      process.env.KANTO62_WEB_ORIGIN?.startsWith("https://") === true,
    follow: process.env.KANTO62_INDEX_PUBLIC === "1",
  },
};

const initializeTheme = `try{const theme=localStorage.getItem("k62-theme");if(theme==="light"||theme==="dark")document.documentElement.dataset.theme=theme}catch{}`;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased [scrollbar-color:var(--input)_var(--background)]">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:p-3"
          href="#content"
        >
          Skip to content
        </a>
        <PublicHeader />
        <main id="content" className="min-w-0 flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
