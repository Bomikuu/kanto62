export const studioGroups = [
  {
    id: "online",
    title: "Get your business online",
    description:
      "Give customers a place to check your hours, see what you offer, and get in touch.",
    products: ["website-builder"],
  },
  {
    id: "operations",
    title: "Take bookings and payments",
    description:
      "Show appointment availability and keep payment records easy to track.",
    products: ["pixelcore", "pixelflow"],
  },
  {
    id: "automation",
    title: "Automate routine work",
    description:
      "Connect recurring tasks and help customers find answers to common questions.",
    products: ["pixel-workflows", "smokey-chatbot"],
  },
] as const;

export const capabilities: Record<string, [string, string][]> = {
  "website-builder": [
    [
      "Publish a storefront",
      "Give customers a web address where they can find your business and see what you offer.",
    ],
    [
      "Keep details current",
      "Edit your storefront when hours, contact details, or offerings change.",
    ],
    [
      "Use your own domain",
      "Connect a domain you already own on an eligible storefront plan.",
    ],
  ],
  pixelcore: [
    [
      "Show available times",
      "Let customers choose from the times you have available.",
    ],
    [
      "Manage capacity",
      "Set how many people or appointments you can serve in a time slot.",
    ],
    [
      "Organize staff schedules",
      "Keep availability in step with the people who handle appointments.",
    ],
  ],
  pixelflow: [
    [
      "Share a checkout link",
      "Send customers to a hosted checkout from your website or a message.",
    ],
    [
      "Track payment status",
      "See whether a payment is still pending or has been recorded.",
    ],
    [
      "Reconcile payments",
      "Match payment records to the transactions they belong to.",
    ],
  ],
  "pixel-workflows": [
    ["Set a trigger", "Choose the event that starts a recurring task."],
    ["Connect steps", "Pass information between tools as the work progresses."],
    [
      "Review results",
      "Check what a workflow did and follow up when a step needs attention.",
    ],
  ],
  "smokey-chatbot": [
    [
      "Answer common questions",
      "Use your business information to answer routine customer questions.",
    ],
    [
      "Add chat to your site",
      "Give visitors a way to ask about your services while they browse.",
    ],
    [
      "Guide the next step",
      "Help customers find the relevant page or contact channel.",
    ],
  ],
};

export const serviceArtwork: Record<string, { src: string; alt: string }> = {
  "website-builder": {
    src: "/art/services/website-builder.webp",
    alt: "Illustration of a merchant arranging photos for a storefront website",
  },
  pixelflow: {
    src: "/art/services/pixelflow.webp",
    alt: "Illustration of a card and receipt representing payments",
  },
  "pixel-workflows": {
    src: "/art/services/pixel-workflows.webp",
    alt: "Illustration of a package moving through a connected series of tasks",
  },
  "smokey-chatbot": {
    src: "/art/services/smokey-chatbot.webp",
    alt: "Illustration of a merchant answering customer questions through chat",
  },
};
