import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-6">
      <Card>
        <CardContent className="grid justify-items-start gap-3">
          <h1>Listing unavailable</h1>
          <Button asChild>
            <Link href="/directory">Browse the directory</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
