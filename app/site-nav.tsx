"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MapPin, Search } from "lucide-react";
import { Appearance } from "./theme";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  ["/directory", "Directory"],
  ["/services", "Services"],
  ["/articles", "Articles"],
  ["/about", "About"],
] as const;

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`inline-flex shrink-0 items-center font-bold tracking-tight ${compact ? "gap-2 text-lg" : "gap-2.5 text-xl"}`}
      href="/"
      aria-label="kanto62 home"
    >
      <span
        className={`grid place-items-center rounded-md bg-primary text-primary-foreground ${compact ? "size-6" : "size-8"}`}
      >
        <MapPin
          size={compact ? 15 : 18}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </span>
      <span>
        kanto<span className="text-primary">62</span>
      </span>
    </Link>
  );
}

export function PublicHeader() {
  const isHome = usePathname() === "/";
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div
        className={
          isHome
            ? "mx-auto flex h-14 w-[calc(100%-2.5rem)] max-w-7xl items-center justify-between gap-3 sm:w-[87%] lg:w-[84%]"
            : "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
        }
      >
        <Brand compact={isHome} />
        <SiteNav compact={isHome} />
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isHome && (
            <Button
              asChild
              variant="ghost"
              className="hidden aspect-square rounded-none md:inline-flex"
            >
              <a href="#landing-search" aria-label="Search the directory">
                <Search aria-hidden="true" />
              </a>
            </Button>
          )}
          <div className={isHome ? "hidden md:block" : "contents"}>
            <Appearance square={isHome} />
          </div>
          <Button
            asChild
            variant="outline"
            className={
              isHome
                ? "hidden rounded-none sm:inline-flex"
                : "hidden sm:inline-flex"
            }
          >
            <Link href="/merchant">
              {isHome ? "Log in" : "Merchant workspace"}
            </Link>
          </Button>
          {isHome && (
            <Button asChild className="hidden rounded-none sm:inline-flex">
              <Link href="/intake?goal=listing">Add your business</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

const linkClass =
  "px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground";

export function SiteNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") ? "page" : undefined;

  return (
    <>
      <nav
        className="hidden items-center gap-1 md:flex"
        aria-label="Main navigation"
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={
              compact
                ? "px-2.5 py-1.5 text-xs font-medium hover:bg-muted aria-[current=page]:bg-accent"
                : linkClass + " rounded-md"
            }
            aria-current={active(href)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className={
              compact
                ? "order-last aspect-square rounded-none md:hidden"
                : "order-last md:hidden"
            }
            size={compact ? "default" : "icon"}
            variant="outline"
            aria-label="Open navigation"
            title="Open navigation"
          >
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className={
            compact
              ? "w-72 [&_[data-slot=sheet-close]]:size-10 [&_[data-slot=sheet-close]]:rounded-none"
              : "w-72"
          }
        >
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Explore kanto62 pages.
            </SheetDescription>
          </SheetHeader>
          <nav className="grid gap-1 px-4" aria-label="Main navigation">
            {[
              ...links,
              ["/merchant", "Merchant workspace"],
              ...(compact
                ? [["/intake?goal=listing", "Add your business"]]
                : []),
            ].map(([href, label]) => (
              <SheetClose asChild key={href}>
                <Link
                  href={href}
                  className={compact ? linkClass : linkClass + " rounded-md"}
                  aria-current={active(href)}
                >
                  {label}
                </Link>
              </SheetClose>
            ))}
          </nav>
          {compact && (
            <div className="px-4 pb-4">
              <Appearance square />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
