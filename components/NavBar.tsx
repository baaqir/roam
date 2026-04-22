"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileSetup } from "./ProfileSetup";
import {
  getProfile,
  topInterestEmoji,
  hasProfile as checkHasProfile,
} from "@/lib/profile";

export function NavBar() {
  const path = usePathname();
  const isHome = path === "/";
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileEmoji, setProfileEmoji] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    setProfileExists(checkHasProfile());
    if (profile) setProfileEmoji(topInterestEmoji(profile));
  }, [showProfileSetup]);

  // Transparent → solid nav on scroll (home page only)
  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    function onScroll() { setScrolled(window.scrollY > 20); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const handleCloseProfile = useCallback(() => {
    setShowProfileSetup(false);
    const profile = getProfile();
    setProfileExists(checkHasProfile());
    if (profile) setProfileEmoji(topInterestEmoji(profile));
  }, []);

  const solid = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solid
            ? "bg-[var(--surface)]/95 backdrop-blur-lg border-b border-[var(--border-subtle)] shadow-sm"
            : "bg-gradient-to-b from-black/40 to-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="group">
              <span
                className={`text-xl font-bold italic tracking-tight transition-colors duration-300 group-hover:opacity-80 ${
                  solid ? "text-[var(--fg)]" : "text-white"
                }`}
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
              >
                Roam
              </span>
            </Link>
            <div className="hidden sm:flex gap-1">
              {[
                { href: "/", label: "Plan" },
                { href: "/trips", label: "My Trips" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={path === link.href ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    path === link.href
                      ? solid
                        ? "bg-[var(--accent-light)] text-[var(--accent)]"
                        : "bg-white/15 text-white"
                      : solid
                        ? "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfileSetup(true)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-300 ${
                solid
                  ? "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Travel preferences"
            >
              {profileExists ? (
                <span className="text-base">{profileEmoji}</span>
              ) : (
                <span className="relative text-xs italic">
                  Preferences
                  <span className="absolute -top-0.5 -right-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {showProfileSetup && (
        <ProfileSetup asSettings onClose={handleCloseProfile} />
      )}
    </>
  );
}
