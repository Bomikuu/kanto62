import Image from "next/image";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const popular = [
  ["Cafés", "/directory?category=restaurant&q=cafe"],
  ["Restaurants", "/directory?category=restaurant"],
  ["Phone repair", "/directory?category=repair"],
  ["Small stores", "/directory?category=sari-sari"],
] as const;

export function LandingHero() {
  return (
    <section className="relative isolate grid grid-cols-1 overflow-hidden bg-linear-to-b md:block from-[#d8edff] via-[#e6f3ff] to-[#f1f7fd] text-[#10264b] dark:from-[#15243e] dark:via-[#1c3354] dark:to-[#172941] dark:text-foreground">
      <div className="pointer-events-none relative -z-10 col-start-1 row-start-2 -mt-3 mb-8 aspect-[2] w-full md:absolute md:inset-y-0 md:right-0 md:mt-0 md:mb-0 md:aspect-auto md:w-[62%] md:mask-[linear-gradient(to_right,transparent,black_18%)]">
        <Image
          src="/art/davao-daylight-banner.webp"
          alt=""
          fill
          preload
          sizes="(min-width: 768px) 62vw, 100vw"
          className="object-contain object-bottom md:object-cover md:object-[45%_58%]"
        />
      </div>
      <div className="relative col-start-1 row-start-1 mx-auto flex w-[calc(100%-2.5rem)] max-w-7xl flex-col items-start pt-9 pb-5 sm:w-[87%] md:min-h-[clamp(27rem,40vw,41rem)] md:justify-center md:py-16 lg:w-[84%]">
        <p className="inline-flex items-center gap-1.5 border border-white/65 bg-card/75 px-3 py-1.5 text-xs font-semibold dark:border-white/15 dark:bg-background/70">
          <MapPin size={14} className="text-primary" aria-hidden="true" />
          Davao City, Philippines
        </p>
        <h1 className="mt-4 max-w-[18ch] text-[clamp(2.5rem,4.55vw,4.5rem)] leading-[1.01] font-bold tracking-[-0.038em]">
          <span className="block">Find and support</span>{" "}
          <span className="block">local businesses</span>{" "}
          <span className="relative block w-fit pb-1 text-primary after:absolute after:right-1 after:bottom-0 after:h-1 after:w-4/5 after:-rotate-2 after:rounded-[50%] after:bg-current after:content-['']">
            in Davao.
          </span>
        </h1>
        <p className="mt-4 max-w-[33ch] text-base leading-snug text-[#263f68] dark:text-muted-foreground">
          Discover shops, services, and experiences in your neighborhood.
        </p>
        <form
          action="/directory"
          className="mt-5 flex w-full items-center gap-2 border border-white bg-card p-1.5 text-card-foreground shadow-[0_5px_18px_#28457b1c] focus-within:ring-2 focus-within:ring-ring md:max-w-[min(43vw,36rem)] dark:border-border"
        >
          <Search
            size={18}
            className="ml-2 shrink-0 text-primary"
            aria-hidden="true"
          />
          <Input
            id="landing-search"
            type="search"
            name="q"
            aria-label="Search the Davao directory"
            placeholder="Search the directory"
            className="h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0.5 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button type="submit" className="rounded-none">
            Search
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold">Popular</span>
          {popular.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-7 items-center border border-primary/15 bg-card/70 px-2.5 text-xs font-medium transition-colors hover:bg-card dark:bg-background/65"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
