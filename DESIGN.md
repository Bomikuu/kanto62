---
name: kanto62
description: A neighborhood directory for Davao City and the workspaces that support it.
colors:
  background: "#f9fafc"
  foreground: "#161f33"
  card: "#fefeff"
  primary: "#294fd1"
  primary-foreground: "#fdfdff"
  muted: "#eef1f7"
  muted-foreground: "#4c5a73"
  accent: "#e9efff"
  accent-foreground: "#233f97"
  destructive: "#a82a31"
  border: "#dce2ed"
  input: "#7485a1"
  ring: "#2f5ad9"
  dark-background: "#111725"
  dark-foreground: "#f0f3fc"
  dark-card: "#191f30"
  dark-primary: "#a8baff"
  dark-primary-foreground: "#13244d"
  dark-muted: "#242d42"
  dark-muted-foreground: "#b8c4dc"
  dark-accent: "#243450"
  dark-accent-foreground: "#c1d0ff"
  dark-destructive: "#ffb4b6"
  dark-border: "#333f56"
  dark-input: "#687894"
  dark-ring: "#93abff"
typography:
  display:
    fontFamily: "Instrument Sans, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 4.55vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Instrument Sans, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Instrument Sans, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Instrument Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "Instrument Sans, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label:
    fontFamily: "Instrument Sans, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  4xl: "32px"
spacing:
  quarter: "4px"
  half: "8px"
  three-quarters: "12px"
  base: "16px"
  gutter: "20px"
  wide-gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0px 10px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, #294fd1 90%, transparent)"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0px 10px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0px 10px"
    height: "40px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "40px"
  badge-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    padding: "2px 8px"
    height: "20px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
  navigation-current:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  category-current:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  form-status:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.three-quarters}"
---

# Design System for kanto62

## Overview

**Creative North Star: "The Davao neighborhood directory"**

The public site uses locally relevant imagery and plain labels to make the directory feel familiar. Search and map controls stay close to the places they describe. The homepage uses a transparent editorial illustration of a Davao street corner. Listing and article photography shows everyday settings.

The merchant and studio workspaces carry the same cool surfaces, type, and cobalt actions into denser navigation, forms, and records. Dividers and consistent alignment let users scan lists and find their next action.

**Key Characteristics:**

- Davao street scenes and category photography on public surfaces.
- Cool neutrals, cobalt actions, and pale blue selection states.
- Shared shadcn components with a compact workspace layout.

## Colors

Light mode pairs a cool off-white canvas with nearly white cards and navy text. Dark mode uses navy surfaces, near-white text, and a lighter blue accent. The Light and Dark settings apply their respective palettes, while System follows the device preference. `@app/style.css` defines the colors and their mapping to shadcn roles.

### Primary

- **Cobalt** identifies primary buttons, action links, map markers, and the brand mark. Use the corresponding primary foreground on solid primary surfaces.
- **Blue tint** signals the current route or category and appears on selected icons and callouts. A stronger blue supplies keyboard focus.
- **Destructive red** identifies errors and destructive actions.

### Neutral

- **Cool canvas and card** separate the page background from panels, cards, popovers, and workspace navigation.
- **Slate** carries secondary descriptions, location details, and counts. **Muted** supplies neutral fills and hover states.
- **Border and input** separate surfaces and delineate fields. Form fields use the stronger of the two strokes.

**The Primary Accent Rule.** Use cobalt for primary actions, links, and selection cues. Use the neutral palette for surrounding surfaces and secondary controls.

## Typography

The interface uses the self-hosted Instrument Sans variable font (400–700) with Arial and generic sans-serif fallbacks. Regular text carries explanations, medium text identifies controls, and semibold titles establish hierarchy. Bold weight appears in the wordmark.

- **Display** (600, approximately 32–61px, 1.02 line height) leads the landing hero. Services use 48–72px.
- **Headline** (600, 30px) is the public section-heading style. Page titles and workspace headings can use larger sizes where the layout needs a distinct hierarchy.
- **Title** (600, 18px) labels category cards and similar content. The generic card title defaults to 16px and medium weight.
- **Body** (400, 16px) is the baseline. The homepage introduction uses 16–20px, and metadata commonly uses 14px.
- **Control and label** (500, 14px and 12px) identify compact actions and category or status tags. Standalone inputs retain 16px text below 768px.

## Layout

The shared public container caps at 80rem. Horizontal padding starts at 20px and increases to 32px at 640px. The sticky header is 64px tall. Inline navigation appears from 768px, and the right-side navigation sheet serves narrower screens.

The landing page uses a sky-blue hero with transparent Davao street art, an inset category panel, a horizontally scrollable featured rail, and an illustrated merchant panel. Statistics sit below the merchant panel. Testimonials, pricing, the single-column article list, and frequently asked questions follow as separate sections. Main sections use 56px, 64px, or 80px of separation by breakpoint. On smaller screens the hero artwork sits below search and the featured rail remains scrollable. Services use a full-height banner with a separate editorial illustration. The directory list adds a 19rem map preview column at the same breakpoint, while a Map view control remains in the directory header on narrower layouts.

The workspace uses a 20px gap between its navigation, content, and stacked panels. Its desktop sidebar sets a 14rem width and a 3.25rem icon-width token. Below 768px, the sidebar opens as an 18rem sheet. Keep the breadcrumb, sidebar toggle, and account control together in the workspace toolbar.

## Elevation & Depth

Cards rely on a thin edge and a change in surface color. The homepage search uses a solid card surface against the sky-blue hero. The floating workspace sidebar uses a subtle shadow and a border-colored ring. Map markers use a stronger shadow against the basemap. The sidecar captures the exact shadow values.

**The Surface Boundaries Rule.** Group content with surface colors, thin edges, and dividers. Use soft shadows where a control sits against the page or map.

## Shapes

Controls use small, consistent corners. Standard buttons and inputs use 10px corners, compact navigation items use 8px, and cards use 14px. Larger photographic crops and callouts use 18px where they need a larger frame. Compact metadata badges use pill corners and map markers are circular.

## Components

### Buttons and fields

Use the shadcn button variants for solid primary actions, outlined alternatives, and ghost utilities. Buttons and fields commonly use a 40px base height. The primary button softens its fill on hover, and outlined buttons take a neutral fill. Fields use an input-colored border, slate placeholder text, and a blue focus ring. Invalid fields use the destructive stroke and ring. Disabled controls mute their appearance.

The combined search field uses a shared border and focus-within ring. A search icon sits beside the labeled field, with a solid Search button at the trailing edge. See `@app/page.tsx` and `@app/directory/page.tsx`.

### Form feedback

Merchant forms report outcomes in place near the relevant fields or action. Status messages use a blue-tinted surface and `role="status"`. Errors use a red-tinted surface and `role="alert"`. The submit button can show a short pending label while the action runs. See `@components/forms.tsx` and `@app/merchant/[slug]/billing/form.tsx`.

### Cards, badges, and filters

Cards use the card surface and a one-pixel outline. The standard shadcn card uses 16px interior spacing, with 12px for the small variant. Category links share a raised, icon-led navigation bar. Featured place cards and illustrated offerings crop photography edge to edge and use a slight hover lift when reduced motion is off. Sample ratings and content use visible disclosure. Directory category filters are links that retain search context and show the current filter with a tinted surface. Neutral badges support compact category and sample-listing labels.

### Navigation

The public navigation uses medium text and restrained hover backgrounds. The current route uses a pale blue fill and dark blue text in Light mode. The workspace uses the same accent family with icon-and-label menu items, named controls in the collapsed rail, and a breadcrumb above the content. Use `aria-current` for the active page or filter and retain the visible keyboard focus treatment. See `@app/site-nav.tsx` and `@components/workspace-shell.tsx`.

### Footer

The landing footer follows the active site theme. Other public routes use the dark footer surface. Keep brand, discovery, business links, and contact information in separate groups with quiet dividers. Future items use a Planned label and display as text.

## Do's and Don'ts

- **Do** use the shared semantic colors so surfaces, controls, and focus respond to Light, Dark, and System.
- **Do** use locally relevant public imagery and label illustrative scenes when the distinction matters.
- **Do** use the shadcn Radix primitives and Tailwind utilities for shared control and layout patterns.
- **Do** pair color changes with meaningful labels and keyboard focus for interactive states.
