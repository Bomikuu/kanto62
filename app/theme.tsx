"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = {
  system: { label: "System", Icon: Monitor },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
};
type Theme = keyof typeof themes;
const getTheme = (): Theme => {
  const value = document.documentElement.dataset.theme;
  return value === "light" || value === "dark" ? value : "system";
};
const serverTheme = (): Theme => "system";
function subscribe(callback: () => void) {
  window.addEventListener("kanto-theme", callback);
  return () => window.removeEventListener("kanto-theme", callback);
}
function changeTheme(theme: string) {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("k62-theme", theme);
  } catch {}
  window.dispatchEvent(new Event("kanto-theme"));
}

export function Appearance({ square = false }: { square?: boolean }) {
  const theme = useSyncExternalStore(subscribe, getTheme, serverTheme);
  const { Icon } = themes[theme];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={square ? "default" : "icon"}
          className={square ? "aspect-square rounded-none" : undefined}
          aria-label="Appearance"
          title="Appearance"
        >
          <Icon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={square ? "rounded-none" : undefined}
      >
        <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
          {Object.entries(themes).map(([value, { Icon, label }]) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className={square ? "rounded-none" : undefined}
            >
              <Icon aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
