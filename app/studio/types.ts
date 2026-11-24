export const stages = {
  qualified: "Qualified",
  demo_booked: "Demo booked",
  won: "Won",
  closed: "Closed",
} as const;

export const categories: Record<string, string> = {
  restaurant: "Dining",
  repair: "Electronics",
  "sari-sari": "Small stores",
};

export const sections = {
  prospects: "Prospects",
  leads: "AI leads",
  contacts: "Contacts",
  intakes: "Listing review",
  report: "Funnel",
} as const;

export type Section = keyof typeof sections;

export type Evidence = {
  id: string;
  business: string;
  verified: string;
  product: string;
  goal: string;
  category: string;
  barangay: string;
  referral: string;
  branch: string;
  reviewed: string | null;
  demo: boolean;
  contact_allowed: boolean;
  landmark?: string;
  hours?: string;
  description?: string;
};

export type Match = {
  product: string;
  reason: string;
  evidence: string;
  evidence_date: string;
  confidence: "high" | "medium";
  draft: string;
};

export type Lead = Evidence & {
  recommendations?: Match[];
  name?: string;
  channel?: string;
  destination?: string;
  marketing?: boolean;
};

export type Prospect = {
  id: number;
  product: string;
  owner: string;
  stage: keyof typeof stages;
  next_action: string;
  draft: string;
  evidence: Evidence;
  recommendations?: Match[];
};

export function verifiedDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}
