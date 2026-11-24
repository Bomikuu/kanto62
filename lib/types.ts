import type { components } from "./schema";
export type Business = components["schemas"]["Business"];
export type Slot = components["schemas"]["Slot"];
export const art = {
  restaurant: "food",
  repair: "repair",
  "sari-sari": "shop",
};
export const primary = {
  reservation: "Reserve a table",
  appointment: "Book a diagnostic",
  stock_inquiry: "Ask about stock",
};
export function manilaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export const manilaTime = (utc: string) =>
  new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(utc));
