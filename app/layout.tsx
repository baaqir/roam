import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <NavBar />
          <div className="animate-page-fade-in">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
