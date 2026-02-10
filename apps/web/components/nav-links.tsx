"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/harnesses", label: "Harnesses" },
  { href: "/tasks", label: "Tasks" },
  { href: "/methodology", label: "Methodology" },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href)

        return (
          <Button
            key={link.href}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            nativeButton={false}
            render={<Link href={link.href} />}
          >
            {link.label}
          </Button>
        )
      })}
    </nav>
  )
}
