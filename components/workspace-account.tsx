"use client";

import { useRef } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/actions";
import { globalLogout } from "@/app/merchant/actions";

export function WorkspaceAccount({
  username,
  studio,
}: {
  username: string | null;
  studio: boolean;
}) {
  const name = username || "Studio account";
  const localForm = useRef<HTMLFormElement>(null);
  const studioForm = useRef<HTMLFormElement>(null);
  return (
    <>
      <form ref={localForm} action={signOut} hidden />
      {studio && <form ref={studioForm} action={globalLogout} hidden />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="shrink-0 px-2 sm:pr-2.5"
            aria-label={name + " account menu"}
            title={name + " account menu"}
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-accent font-semibold text-primary">
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-36 truncate sm:inline">{name}</span>
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => localForm.current?.requestSubmit()}>
            <LogOut aria-hidden="true" /> Sign out of kanto62
          </DropdownMenuItem>
          {studio && (
            <DropdownMenuItem
              onSelect={() => studioForm.current?.requestSubmit()}
            >
              <LogOut aria-hidden="true" /> Sign out of all studio apps
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
