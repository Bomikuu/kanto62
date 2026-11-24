import { MessageSquare, Quote, Star } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { SampleReview } from "@/lib/sample-listings";

export function Stars({
  rating,
  compact = false,
}: {
  rating: number;
  compact?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={
        compact
          ? "flex items-center gap-0.5 text-amber-600 dark:text-amber-400"
          : "flex items-center gap-1 text-primary"
      }
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${compact ? "size-3" : "size-4"} ${index < rating ? "fill-current" : ""}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ReviewCards({
  reviews,
  compact = false,
}: {
  reviews: (SampleReview & { role?: string })[];
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <Card
            key={review.name}
            className="h-full border bg-card/75 py-0 shadow-sm ring-0"
          >
            <CardContent className="grid h-full grid-cols-[auto_minmax(0,1fr)] gap-3 p-4 xl:p-5">
              <Quote
                size={19}
                fill="currentColor"
                className="mt-0.5 rotate-180 text-primary/65"
                aria-hidden="true"
              />
              <figure className="flex min-w-0 flex-col gap-3">
                <blockquote className="flex-1 text-sm leading-relaxed">
                  “{review.quote}”
                </blockquote>
                <figcaption className="flex flex-wrap items-center gap-2.5">
                  <Avatar className="size-7" size="sm">
                    <AvatarFallback className="bg-accent text-[0.55rem] font-semibold text-primary">
                      {review.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-[0.68rem] leading-tight">
                    <span className="block font-semibold">{review.name}</span>
                    <span className="text-muted-foreground">{review.role}</span>
                  </div>
                  <Stars rating={review.stars} compact />
                </figcaption>
              </figure>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reviews.map((review) => (
        <Card
          key={review.name}
          className="h-full py-0 hover:ring-primary/35 motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1"
        >
          <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
            <Stars rating={review.stars} />
            <figure className="flex flex-1 flex-col gap-4">
              <blockquote className="flex-1 leading-relaxed">
                “{review.quote}”
              </blockquote>
              <figcaption className="border-t pt-3 text-sm">
                <span className="block font-semibold">{review.name}</span>
                {review.role && (
                  <span className="text-muted-foreground">{review.role}</span>
                )}
              </figcaption>
            </figure>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PublicEmpty({
  title,
  children,
  icon = <MessageSquare size={20} aria-hidden="true" />,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-dashed bg-muted/45 p-5 [body:has([data-landing])_&]:rounded-none">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-primary [body:has([data-landing])_&]:rounded-none">
        {icon}
      </span>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <div className="text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
