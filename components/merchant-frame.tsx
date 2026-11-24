import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  PencilLine,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { WorkspaceShell } from "./workspace-shell";
import { WorkspaceAccount } from "./workspace-account";
import { api, ApiError } from "@/lib/api";
import { currentSession } from "@/lib/oidc";

type Surface = "overview" | "editor" | "billing" | "requests";
type Context = { slug: string; name: string; role?: string };

export async function MerchantFrame({
  children,
  context,
  current,
  railControls,
  back,
  account,
}: {
  children: ReactNode;
  context?: Context;
  current?: Surface;
  railControls?: ReactNode;
  back?: { href: string; label: string };
  account?: ReactNode;
}) {
  const ancestor = back ?? { href: "/directory", label: "Directory" };
  const sectionClass =
    "mx-auto grid w-full max-w-7xl gap-5 px-5 py-7 sm:gap-6 sm:px-8 sm:py-9";
  if (!context) {
    return (
      <section className={sectionClass}>
        <nav
          className="text-sm text-muted-foreground"
          aria-label="Merchant breadcrumb"
        >
          <Link
            className="inline-flex items-center gap-2 hover:text-primary"
            href={ancestor.href}
          >
            <ArrowLeft size={16} aria-hidden="true" /> {ancestor.label}
          </Link>
        </nav>
        <div className="grid min-w-0 gap-5">{children}</div>
      </section>
    );
  }

  const { slug, name, role } = context;
  const workspace = "/merchant?branch=" + encodeURIComponent(slug);
  const root = "/businesses/" + encodeURIComponent(slug);
  const routes = [
    {
      id: "overview",
      label: "Overview",
      href: workspace,
      Icon: LayoutDashboard,
    },
    {
      id: "editor",
      label: "Storefront",
      href: root + "/manage",
      Icon: PencilLine,
    },
    {
      id: "billing",
      label: "Plans & domains",
      href: "/merchant/" + slug + "/billing",
      Icon: CreditCard,
    },
    {
      id: "requests",
      label: "Bookings & inquiries",
      href: "/merchant/" + slug + "/requests",
      Icon: CalendarDays,
    },
  ] as const;
  const active = routes.find(({ id }) => id === current);
  const jar = await cookies();
  let accountControl = account;
  if (!accountControl && (jar.has("k62merchant") || jar.has("k62oidc"))) {
    try {
      const [{ username }, studio] = await Promise.all([
        api<{ username: string | null }>("/auth/session/", {}, true),
        currentSession(),
      ]);
      accountControl = (
        <WorkspaceAccount username={username} studio={Boolean(studio)} />
      );
    } catch (error) {
      if (!(error instanceof ApiError) || ![401, 403].includes(error.status))
        throw error;
    }
  }

  return (
    <section className={sectionClass}>
      <WorkspaceShell
        title={name}
        subtitle={
          role === "owner"
            ? "Owner access"
            : role === "viewer"
              ? "Viewer access"
              : undefined
        }
        defaultOpen={jar.get("sidebar_state")?.value !== "false"}
        controls={railControls}
        account={accountControl}
        links={routes
          .filter(({ id }) => role !== "viewer" || id === "overview")
          .map(({ id, label, href, Icon }) => ({
            href,
            label,
            active: id === current,
            icon: <Icon size={17} aria-hidden="true" />,
          }))}
        footer={
          <Link
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-muted"
            href={root}
          >
            View public storefront <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        }
        breadcrumb={
          <Breadcrumb className="min-w-0" aria-label="Merchant breadcrumb">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbLink asChild>
                  <Link className="truncate" href={ancestor.href}>
                    {ancestor.label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {current !== "overview" && ancestor.href !== workspace && (
                <>
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem className="hidden sm:inline-flex">
                    <BreadcrumbLink asChild>
                      <Link href={workspace}>Merchant workspace</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbPage>{active?.label ?? "Workspace"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        {children}
      </WorkspaceShell>
    </section>
  );
}

export function MerchantHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {children && (
        <div className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
          {children}
        </div>
      )}
    </div>
  );
}

export function AccessIllustration() {
  return (
    <div className="relative hidden min-h-80 min-w-0 overflow-hidden bg-muted lg:block">
      <img
        src="/art/davao-corner.webp"
        width={1440}
        height={960}
        className="absolute inset-0 h-full w-full object-cover"
        alt="Illustrative Davao neighborhood street and corner shop"
      />
    </div>
  );
}
