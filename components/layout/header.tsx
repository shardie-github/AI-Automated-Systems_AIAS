"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-bg/70 border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg">
          Hardonia
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-4">
          <Link href="/play" className="px-3 py-2 hover:underline text-sm">
            Play
          </Link>
          <Link href="/community" className="px-3 py-2 hover:underline text-sm">
            Community
          </Link>
          <Link href="/challenges" className="px-3 py-2 hover:underline text-sm">
            Challenges
          </Link>
          <Link href="/leaderboard" className="px-3 py-2 hover:underline text-sm">
            Leaderboard
          </Link>
          <Link href="/journal" className="px-3 py-2 hover:underline text-sm">
            Journal
          </Link>
          <ThemeToggle />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
