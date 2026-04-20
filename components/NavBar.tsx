"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileSetup } from "./ProfileSetup";
import { getProfile, topInterestEmoji, hasProfile as checkHasProfile } from "@/lib/profile";

export function NavBar() {
  const path = usePathname();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileEmoji, setProfileEmoji] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    setProfileExists(checkHasProfile());
    if (profile) {
      setProfileEmoji(topInterestEmoji(profile));
    }
  }, [showProfileSetup]); // re-check when modal closes

  const handleOpenProfile = useCallback(() => {
    setShowProfileSetup(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfileSetup(false);
    // Refresh profile state after close
    const profile = getProfile();
    setProfileExists(checkHasProfile());
    if (profile) {
      setProfileEmoji(topInterestEmoji(profile));
    }
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] glass" aria-label="Main navigation">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] text-sm font-bold text-white shadow-sm transition-transform duration-200 ease-out group-hover:scale-105">
                R
              </div>
              <span className="text-base font-bold tracking-tight text-[var(--fg)]">
                Roam
              </span>
            </Link>
            <div className="flex gap-4 text-sm">
              <NavLink href="/" label="Plan" active={path === "/"} />
              <NavLink href="/trips" label="My Trips" active={path === "/trips"} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenProfile}
              className="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-all duration-200"
              aria-label="Travel preferences"
            >
              {profileExists ? (
                <span className="text-base">{profileEmoji}</span>
              ) : (
                <>
                  <span className="text-xs">Preferences</span>
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
                </>
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
      className={`relative font-medium transition-colors duration-200 rounded-md px-1 focus-ring ${
        active
          ? "text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--fg)]"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-3.5 left-0 right-0 h-0.5 rounded-full bg-[var(--accent)]" />
      )}
    </Link>
  );
}
