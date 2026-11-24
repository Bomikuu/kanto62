"use client";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { linkAccount } from "./actions";
import { Button } from "@/components/ui/button";
export function LinkAccount() {
  const [error, action, pending] = useActionState(linkAccount, "");
  return (
    <form
      action={action}
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start"
    >
      <label>
        Existing merchant username
        <Input name="username" required autoComplete="username" />
      </label>
      <label>
        Merchant password
        <Input
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <Button disabled={pending}>Link my merchant account</Button>
    </form>
  );
}
