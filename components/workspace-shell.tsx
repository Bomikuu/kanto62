"use client";

import { useId, useRef, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { PanelLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export type WorkspaceLink = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
};

type Props = {
  title: string;
  subtitle?: string;
  links: WorkspaceLink[];
  children: ReactNode;
  breadcrumb: ReactNode;
  account?: ReactNode;
  controls?: ReactNode;
  footer?: ReactNode;
  defaultOpen: boolean;
};

export function WorkspaceShell({ defaultOpen, ...props }: Props) {
  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "14rem",
            "--sidebar-width-icon": "3.25rem",
          } as CSSProperties
        }
        className="min-h-0 items-start gap-5 [&>[data-slot=sidebar]]:sticky [&>[data-slot=sidebar]]:top-22 [&>[data-slot=sidebar]]:shrink-0 [&_[data-slot=sidebar-gap]]:hidden"
      >
        <WorkspaceLayout {...props} />
      </SidebarProvider>
    </TooltipProvider>
  );
}

function WorkspaceLayout({
  title,
  subtitle,
  links,
  children,
  breadcrumb,
  account,
  controls,
  footer,
}: Omit<Props, "defaultOpen">) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const { isMobile, open, openMobile, setOpenMobile, toggleSidebar } =
    useSidebar();
  const expanded = isMobile ? openMobile : open;

  function closeMobile() {
    if (!isMobile) return;
    setOpenMobile(false);
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="floating"
        onMobileCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
        className="!relative !inset-auto !h-auto !p-0 motion-reduce:transition-none"
      >
        <SidebarHeader className="gap-1 border-b p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{title}</p>
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={closeMobile}
              aria-label="Close workspace navigation"
            >
              <X />
            </Button>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </SidebarHeader>
        <SidebarContent id={id} className="gap-2 p-2">
          {controls && (
            <div className="group-data-[collapsible=icon]:hidden">
              {controls}
            </div>
          )}
          <nav aria-label={title + " navigation"}>
            <SidebarMenu>
              {links.map(({ href, label, icon, active }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={label}
                    isActive={active}
                    className="h-10 font-medium data-active:text-primary motion-reduce:transition-none"
                  >
                    <Link
                      href={href}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMobile}
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarContent>
        {footer && (
          <SidebarFooter className="border-t group-data-[collapsible=icon]:hidden">
            {footer}
          </SidebarFooter>
        )}
      </Sidebar>
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-5">
        <div className="flex min-h-11 items-center justify-between gap-2 border-b pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              ref={trigger}
              variant="outline"
              size="icon"
              aria-label="Toggle workspace navigation"
              title="Toggle workspace navigation"
              aria-expanded={expanded}
              aria-controls={!isMobile || openMobile ? id : undefined}
              onClick={toggleSidebar}
            >
              <PanelLeft aria-hidden="true" />
            </Button>
            {breadcrumb}
          </div>
          {account}
        </div>
        {children}
      </div>
    </>
  );
}
