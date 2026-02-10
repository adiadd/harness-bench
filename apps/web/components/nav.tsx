import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { NavLinks } from "@/components/nav-links";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            harness-bench
          </Link>
          <NavLinks />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
