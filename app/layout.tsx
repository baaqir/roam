import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roam",
  description: "Plan trips, estimate costs, build itineraries",
};

const themeBootstrap = `
(function() {
  try {
    var s = localStorage.getItem('roam.theme');
    var p = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (s === 'dark' || (!s && p)) document.documentElement.classList.add('dark');
  } catch (_) {}
})();
`.trim();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#b5694d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <NavBar />
          {children}
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
