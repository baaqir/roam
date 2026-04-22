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
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileEmoji, setProfileEmoji] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    setProfileExists(checkHasProfile());
    if (profile) setProfileEmoji(topInterestEmoji(profile));
  }, [showProfileSetup]);

  const handleCloseProfile = useCallback(() => {
    setShowProfileSetup(false);
    const profile = getProfile();
    setProfileExists(checkHasProfile());
    if (profile) setProfileEmoji(topInterestEmoji(profile));
  }, []);

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--surface)]/90 backdrop-blur-lg"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="group">
              <span
                className="text-xl font-bold italic tracking-tight text-[var(--fg)] transition-colors duration-200 group-hover:text-[var(--accent)]"
                style={{
                  fontFamily:
                    "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                }}
              >
                Roam
              </span>
            </Link>
            <div className="hidden sm:flex gap-1">
              <NavLink href="/" label="Plan" active={path === "/"} />
              <NavLink
                href="/trips"
                label="My Trips"
                active={path === "/trips"}
              />
              <NavLink
                href="/about"
                label="About"
                active={path === "/about"}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfileSetup(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-all duration-200"
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

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-[var(--accent-light)] text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
      }`}
    >
      {label}
    </Link>
  );
}
