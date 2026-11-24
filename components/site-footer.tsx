import Link from "next/link";
import { ArrowUpRight, Compass, Mail, Store } from "lucide-react";
import { Brand } from "@/app/site-nav";
import { Badge } from "@/components/ui/badge";

const explore = [
  ["/directory", "Business directory"],
  ["/directory?view=map", "Explore the map"],
  ["/articles", "Articles"],
  ["/about", "About kanto62"],
] as const;

const business = [
  ["/intake?goal=listing", "Add your business"],
  ["/merchant", "Merchant workspace"],
  ["/services", "Studio services"],
  ["/#pricing", "Plans and pricing"],
  ["/studio", "Studio workspace"],
] as const;

const linkClass =
  "group flex min-h-9 items-center justify-between gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground";

function FooterLinks({
  links,
  planned,
}: {
  links: readonly (readonly [string, string])[];
  planned: string;
}) {
  return (
    <ul className="grid">
      {links.map(([href, label]) => (
        <li key={href}>
          <Link href={href} className={linkClass}>
            {label}
            <ArrowUpRight
              size={13}
              className="shrink-0 text-primary"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
      <li className="flex min-h-9 flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {planned}
        <Badge variant="outline" className="text-muted-foreground">
          Planned
        </Badge>
      </li>
    </ul>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/35 text-foreground [body:has([data-landing])_&_[data-slot=badge]]:rounded-none [body:has([data-directory-map])_&]:hidden [body:not(:has([data-landing]))_&]:theme-dark [body:not(:has([data-landing]))_&]:border-t-0 [body:not(:has([data-landing]))_&]:bg-[#0a1019]">
      <div className="mx-auto w-[calc(100%-2.5rem)] max-w-7xl py-7 sm:w-[87%] lg:w-[84%] [body:not(:has([data-landing]))_&]:max-w-[96rem] [body:not(:has([data-landing]))_&]:2xl:w-[69%]">
        <div className="grid gap-8 pt-4 pb-9 sm:grid-cols-2 lg:grid-cols-[1.22fr_1fr_1.04fr_1.1fr] lg:gap-x-0 lg:pt-5 [body:not(:has([data-landing]))_&]:border-t [body:not(:has([data-landing]))_&]:py-12">
          <div className="flex flex-col items-start gap-4 lg:pr-9">
            <Brand compact />
            <p className="max-w-64 text-sm leading-relaxed text-muted-foreground">
              A Davao City directory for discovering neighborhood businesses and
              helping them get online.
            </p>
            <p className="mt-1 border-t pt-3 text-xs text-muted-foreground">
              Based in Davao City, Philippines
            </p>
          </div>
          <nav aria-labelledby="footer-explore" className="lg:border-l lg:px-5">
            <h2
              id="footer-explore"
              className="mb-3 flex items-center gap-2 text-sm font-semibold"
            >
              <Compass size={17} className="text-primary" aria-hidden="true" />{" "}
              Explore
            </h2>
            <FooterLinks links={explore} planned="Saved places" />
          </nav>
          <nav
            aria-labelledby="footer-business"
            className="lg:border-l lg:px-5"
          >
            <h2
              id="footer-business"
              className="mb-3 flex items-center gap-2 text-sm font-semibold"
            >
              <Store size={17} className="text-primary" aria-hidden="true" />{" "}
              For businesses
            </h2>
            <FooterLinks links={business} planned="Merchant guides" />
          </nav>
          <nav aria-labelledby="footer-contact" className="lg:border-l lg:pl-5">
            <h2
              id="footer-contact"
              className="mb-3 flex items-center gap-2 text-sm font-semibold"
            >
              <Mail size={17} className="text-primary" aria-hidden="true" />{" "}
              Contact and support
            </h2>
            <FooterLinks
              links={[
                ["/contact", "Contact the studio"],
                ["/#booking", "Book a demo"],
                ["/intake?goal=claim", "Ask about a listing"],
              ]}
              planned="Help center"
            />
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getUTCFullYear()} kanto62</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
              href="/#home-faq"
            >
              Frequently asked questions
            </Link>
            <Link
              className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
              href="/about#studio-work"
            >
              Studio work and references
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
