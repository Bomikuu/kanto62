export type SampleReview = { name: string; stars: number; quote: string };

export const sampleListings = {
  "salo-salo-inasal": {
    image: "/art/food.jpg",
    itemImages: {
      "Chicken inasal": "chicken-inasal",
      "Garlic rice": "garlic-rice",
      "Calamansi juice": "calamansi-juice",
    },
    reviews: [
      {
        name: "Mara L.",
        stars: 5,
        quote:
          "The chicken had a smoky char, and the garlic rice was worth ordering on its own.",
      },
      {
        name: "Paolo D.",
        stars: 4,
        quote:
          "We checked the menu before leaving home. The calamansi juice was a good match for lunch.",
      },
      {
        name: "Celia R.",
        stars: 5,
        quote:
          "Our family shared an extra order of rice. I’d come back for the inasal.",
      },
    ],
  },
  "circuito-repair-lab": {
    image: "/art/repair.jpg",
    itemImages: {
      "Phone diagnosis": "phone-diagnosis",
      "Laptop inspection": "laptop-inspection",
      "Battery check": "battery-check",
    },
    reviews: [
      {
        name: "Jessa V.",
        stars: 5,
        quote:
          "They explained which part needed replacing and gave me an estimate before starting.",
      },
      {
        name: "Anton C.",
        stars: 4,
        quote:
          "I brought my laptop in for a diagnosis. The technician walked me through the options.",
      },
      {
        name: "Rafi M.",
        stars: 5,
        quote:
          "The battery check was quick, and I knew what to expect before ordering a replacement.",
      },
    ],
  },
  "tindahan-ni-nena": {
    image: "/art/shop.jpg",
    itemImages: {
      "Fresh pandesal": "pandesal",
      "White rice": "white-rice",
      "Native eggs": "native-eggs",
    },
    reviews: [
      {
        name: "Lina B.",
        stars: 5,
        quote: "I stopped by for warm pandesal on my way to the terminal.",
      },
      {
        name: "Danilo G.",
        stars: 5,
        quote: "It’s handy to buy a few eggs and just enough rice for dinner.",
      },
      {
        name: "Rosa P.",
        stars: 4,
        quote:
          "The landmark in the listing helped me find the shop the first time.",
      },
    ],
  },
} satisfies Record<
  string,
  { image: string; itemImages: Record<string, string>; reviews: SampleReview[] }
>;

export const sampleTestimonials: (SampleReview & { role: string })[] = [
  {
    name: "Nika S.",
    role: "Neighborhood diner",
    stars: 5,
    quote:
      "I want to know when a place is open and what’s on the menu before I make the trip.",
  },
  {
    name: "Jun P.",
    role: "Repair shop owner",
    stars: 5,
    quote:
      "A booking page would give customers a time to come in and give me room to finish the repair on my bench.",
  },
  {
    name: "Mae D.",
    role: "Small-store owner",
    stars: 4,
    quote:
      "I’d share one link with our hours and stock inquiry form whenever someone asks where to find us.",
  },
];

export function getSampleListing(slug: string, isFixture: boolean) {
  return isFixture && Object.hasOwn(sampleListings, slug)
    ? sampleListings[slug as keyof typeof sampleListings]
    : undefined;
}
