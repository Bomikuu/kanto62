import { api } from "@/lib/api";

export type Product = {
  id: string;
  name: string;
  title: string;
  signal: string;
  description: string;
  example: string;
  status: string;
};
export function catalog() {
  return api<{ products: Product[]; prices: Record<string, number> }>(
    "/catalog/",
  );
}
export const demoLink = (product: string) =>
  "/?product=" + encodeURIComponent(product) + "&referral=service#booking";
