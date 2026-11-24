"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid justify-items-start gap-3 py-6">
      <Alert variant="destructive">
        <AlertTitle>
          <h1 className="text-lg">Couldn’t load this page</h1>
        </AlertTitle>
        <AlertDescription>Try again in a moment.</AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
