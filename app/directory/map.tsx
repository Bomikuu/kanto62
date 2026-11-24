"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  List,
  LocateFixed,
  MapPin,
  Store,
  Utensils,
  X,
} from "lucide-react";
import type mapboxgl from "mapbox-gl";
import type { GeoJSONSource as LibreGeoJSONSource } from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { art, primary, type Business } from "@/lib/types";
import {
  baseStyle,
  basemapBounds,
  cityBounds,
  mapPalette,
  paintMap,
  places,
} from "./basemap";
import "mapbox-gl/dist/mapbox-gl.css";
import "maplibre-gl/dist/maplibre-gl.css";

type Bounds = [number, number, number, number];
type ExplorerProps = {
  businesses: Business[];
  initialBounds?: Bounds;
  initialSelected: string;
  listHref: string;
  controls: ReactNode;
};
const icons = { restaurant: Utensils, repair: Cpu, "sari-sari": Store };
const coord = (b: Business): [number, number] | undefined =>
  b.longitude == null || b.latitude == null
    ? undefined
    : [b.longitude, b.latitude];

function points(data: Business[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: data.flatMap((b) => {
      const coordinates = coord(b);
      return coordinates
        ? [
            {
              type: "Feature",
              properties: { slug: b.slug },
              geometry: { type: "Point", coordinates },
            },
          ]
        : [];
    }),
  };
}

function persist(slug: string, viewport?: Bounds) {
  const url = new URL(location.href);
  if (slug) url.searchParams.set("selected", slug);
  else url.searchParams.delete("selected");
  if (viewport)
    url.searchParams.set("bbox", viewport.map((n) => n.toFixed(5)).join(","));
  history.replaceState(history.state, "", url);
}

function locateBusiness(
  map: mapboxgl.Map,
  position: [number, number],
  immediate = false,
) {
  const compact = matchMedia("(max-width: 767px)").matches;
  map.easeTo({
    center: position,
    zoom: Math.max(16, map.getZoom()),
    offset: compact ? [0, 0] : [175, -10],
    ...(compact
      ? { padding: { top: 200, bottom: 145, left: 12, right: 12 } }
      : {}),
    duration:
      immediate || matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 320,
  });
}

function fitPadding(narrow: boolean) {
  return narrow
    ? { left: 38, right: 38, top: 124, bottom: 150 }
    : { left: 390, right: 104, top: 85, bottom: 75 };
}

export function Explorer({
  businesses,
  initialBounds,
  initialSelected,
  listHref,
  controls,
}: ExplorerProps) {
  const canvas = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | undefined>(undefined);
  const selectedRef = useRef(initialSelected);
  const pendingLocation = useRef<[number, number] | undefined>(undefined);
  const results = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(initialSelected);
  const [sheet, setSheet] = useState(false);
  const [bounds, setBounds] = useState<Bounds | undefined>(initialBounds);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    const host = canvas.current;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = matchMedia("(max-width: 767px)");
    const clusters = new Map<number, mapboxgl.Marker>();
    const markers: mapboxgl.Marker[] = [];
    const currentBounds = (): Bounds | undefined => {
      const b = map.current?.getBounds();
      if (!b) return undefined;
      return [
        Math.max(-180, b.getWest()),
        Math.max(-90, b.getSouth()),
        Math.min(180, b.getEast()),
        Math.min(90, b.getNorth()),
      ];
    };
    const syncBounds = () => {
      const next = currentBounds();
      if (next) setBounds(next);
      persist(selectedRef.current, next);
    };

    async function start() {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      // Both renderers share the map primitives used here. The cluster zoom
      // call below handles the callback and Promise variants explicitly.
      const local = token ? undefined : await import("maplibre-gl");
      local?.setWorkerUrl(
        new URL("/directory/map-worker", location.origin).href,
      );
      const gl = local
        ? (local as unknown as typeof mapboxgl)
        : (await import("mapbox-gl")).default;
      if (cancelled || !host) return;
      if (token && !gl.supported()) {
        setStatus("unavailable");
        return;
      }
      const palette = mapPalette(media.matches);
      const m = new gl.Map({
        container: host,
        style: baseStyle(palette),
        ...(token ? { accessToken: token } : {}),
        center: [125.61, 7.08],
        zoom: 11.2,
        minZoom: 9.5,
        maxZoom: 17,
        maxBounds: basemapBounds,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        renderWorldCopies: false,
      });
      map.current = m;
      m.addControl(
        new gl.NavigationControl({ showCompass: false, visualizePitch: false }),
        "top-right",
      );
      m.on("load", () => {
        setStatus("ready");
        m.addSource("businesses", {
          type: "geojson",
          data: points(businesses),
          cluster: true,
          clusterRadius: 45,
          clusterMaxZoom: 15,
        });
        m.addLayer({
          id: "business-dots",
          type: "circle",
          source: "businesses",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": palette.pin,
            "circle-radius": 7.5,
            "circle-stroke-width": 2.2,
            "circle-stroke-color": palette.stroke,
          },
        });
        m.addSource("selection", {
          type: "geojson",
          data: points(
            businesses.filter((b) => b.slug === selectedRef.current),
          ),
        });
        m.addLayer({
          id: "business-selected",
          type: "circle",
          source: "selection",
          paint: {
            "circle-color": palette.selected,
            "circle-radius": 10,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": palette.stroke,
          },
        });

        for (const [name, position] of places) {
          const label = document.createElement("span");
          label.className =
            "pointer-events-none font-sans text-xs font-semibold text-slate-700 text-shadow-xs text-shadow-white dark:text-slate-200 dark:text-shadow-slate-950";
          if (name === "Davao Gulf") label.classList.add("italic");
          label.textContent = name;
          label.setAttribute("aria-hidden", "true");
          markers.push(
            new gl.Marker({ element: label, anchor: "center" })
              .setLngLat([...position])
              .addTo(m),
          );
        }
        m.fitBounds(initialBounds ?? cityBounds, {
          duration: 0,
          padding: initialBounds ? 16 : fitPadding(narrow.matches),
        });
        m.on("moveend", syncBounds);
        const initialBusiness = businesses.find(
          (business) => business.slug === selectedRef.current,
        );
        const initialPosition =
          pendingLocation.current ??
          (!initialBounds && initialBusiness
            ? coord(initialBusiness)
            : undefined);
        if (initialPosition) locateBusiness(m, initialPosition, true);
        pendingLocation.current = undefined;
        const showPin = (event: mapboxgl.MapLayerMouseEvent) => {
          const slug = event.features?.[0]?.properties?.slug;
          if (typeof slug === "string") {
            if (narrow.matches) setSheet(false);
            selectedRef.current = slug;
            setSelected(slug);
            if (narrow.matches) {
              const business = businesses.find((item) => item.slug === slug);
              const position = business && coord(business);
              if (position) locateBusiness(m, position);
            }
            persist(slug, currentBounds());
          }
        };
        m.on("click", "business-dots", showPin);
        m.on("click", "business-selected", showPin);
        m.on("mouseenter", "business-dots", () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", "business-dots", () => {
          m.getCanvas().style.cursor = "";
        });
      });
      m.on("render", () => {
        if (!m.getSource("businesses") || !m.isSourceLoaded("businesses"))
          return;
        const visible = new Set<number>();
        for (const feature of m.querySourceFeatures("businesses")) {
          const id = feature.properties?.cluster_id;
          if (
            typeof id !== "number" ||
            visible.has(id) ||
            feature.geometry.type !== "Point"
          )
            continue;
          const [lng, lat] = feature.geometry.coordinates;
          const pixel = m.project([lng, lat]);
          if (
            pixel.x < 0 ||
            pixel.y < 0 ||
            pixel.x > host.clientWidth ||
            pixel.y > host.clientHeight
          )
            continue;
          visible.add(id);
          if (clusters.has(id)) continue;

          const button = document.createElement("button");
          button.type = "button";
          button.className =
            "grid size-11 place-items-center rounded-full border-2 border-card bg-primary text-xs font-semibold text-primary-foreground shadow-md hover:scale-105 motion-safe:transition-transform";
          const count = feature.properties?.point_count;
          button.textContent = String(count);
          button.setAttribute("aria-label", `Zoom to ${count} businesses`);
          button.addEventListener("click", () => {
            const source = m.getSource<mapboxgl.GeoJSONSource>("businesses");
            if (!source) return;
            const zoomTo = (zoom: number) =>
              m.easeTo({
                center: [lng, lat],
                zoom,
                duration: reduced.matches ? 0 : 320,
              });
            if (token) {
              source.getClusterExpansionZoom(id, (error, zoom) => {
                if (!error && zoom != null) zoomTo(zoom);
              });
            } else {
              const localSource = source as unknown as LibreGeoJSONSource;
              localSource
                .getClusterExpansionZoom(id)
                .then(zoomTo)
                .catch(() => {});
            }
          });
          clusters.set(
            id,
            new gl.Marker({ element: button }).setLngLat([lng, lat]).addTo(m),
          );
        }
        for (const [id, marker] of clusters)
          if (!visible.has(id)) {
            marker.remove();
            clusters.delete(id);
          }
      });

      m.on("error", () => {
        if (!m.loaded() && !m.getSource("businesses")) setStatus("unavailable");
      });
      m.on("webglcontextlost", () => setStatus("unavailable"));
      m.on("webglcontextrestored", () => setStatus("ready"));
      const update = () => paintMap(m, mapPalette(media.matches));
      const observer = new MutationObserver(update);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      media.addEventListener("change", update);
      release = () => {
        observer.disconnect();
        media.removeEventListener("change", update);
        for (const marker of [...clusters.values(), ...markers])
          marker.remove();
        m.remove();
        map.current = undefined;
      };
    }
    start().catch(() => {
      if (!cancelled) setStatus("unavailable");
    });
    return () => {
      cancelled = true;
      release?.();
    };
  }, [businesses, initialBounds]);

  useEffect(() => {
    const source = map.current?.getSource<mapboxgl.GeoJSONSource>("selection");
    source?.setData(points(businesses.filter((b) => b.slug === selected)));
  }, [businesses, selected]);

  function select(business?: Business) {
    const slug = business?.slug ?? "";
    setSelected(slug);
    selectedRef.current = slug;
    persist(slug, bounds);
    if (!business) {
      pendingLocation.current = undefined;
      return;
    }
    const position = coord(business);
    const narrow = matchMedia("(max-width: 767px)").matches;
    if (narrow) setSheet(false);
    if (position) {
      if (map.current?.getSource("businesses"))
        locateBusiness(map.current, position);
      else pendingLocation.current = position;
    }
    requestAnimationFrame(() =>
      document
        .getElementById("atlas-listing-title")
        ?.focus({ preventScroll: true }),
    );
  }
  const picked = businesses.find((b) => b.slug === selected);
  const nav = new URLSearchParams(listHref.split("?")[1]);
  if (selected) nav.set("selected", selected);
  else nav.delete("selected");
  if (bounds) nav.set("bbox", bounds.map((n) => n.toFixed(5)).join(","));

  return (
    <section
      className="relative isolate h-[calc(100dvh-4rem)] min-h-100 overflow-hidden bg-muted"
      data-directory-map
      aria-label="Davao City directory map"
      data-status={status}
    >
      <div
        ref={canvas}
        className="absolute! inset-0 [&_:is(.mapboxgl-ctrl-top-right,.maplibregl-ctrl-top-right)]:top-52! [&_:is(.mapboxgl-ctrl-top-right,.maplibregl-ctrl-top-right)]:right-3! md:[&_:is(.mapboxgl-ctrl-top-right,.maplibregl-ctrl-top-right)]:top-5! md:[&_:is(.mapboxgl-ctrl-top-right,.maplibregl-ctrl-top-right)]:right-5! [&_:is(.mapboxgl-ctrl,.maplibregl-ctrl)]:m-0! [&_:is(.mapboxgl-ctrl-group,.maplibregl-ctrl-group)]:rounded-md! [&_:is(.mapboxgl-ctrl-group,.maplibregl-ctrl-group)_button]:size-10!"
        aria-label="Map of Davao City"
      />
      <aside className="pointer-events-none absolute inset-0 z-10 md:pointer-events-auto md:inset-auto md:inset-y-5 md:left-5 md:flex md:w-88 md:flex-col md:overflow-hidden md:rounded-xl md:border md:bg-card md:shadow-lg">
        <div className="pointer-events-auto absolute inset-x-3 top-3 grid gap-2 rounded-xl border bg-card p-3 shadow-md md:static md:gap-3 md:rounded-none md:border-0 md:border-b md:p-4 md:shadow-none">
          <div className="flex items-center justify-between gap-2 [&>h1]:text-xl [&>h1]:font-semibold [&>h1]:tracking-tight md:[&>h1]:text-2xl">
            <h1>Explore Davao</h1>
            <Button asChild variant="outline">
              <Link href={"/directory?" + nav}>
                <List size={16} aria-hidden="true" /> List view
              </Link>
            </Button>
          </div>
          {controls}
        </div>
        <div
          ref={results}
          className="group pointer-events-auto absolute inset-x-3 bottom-7 flex max-h-[min(43%,20rem)] min-h-0 flex-col rounded-xl border bg-card shadow-md md:static md:max-h-none md:flex-1 md:rounded-none md:border-0 md:shadow-none"
          data-expanded={sheet}
        >
          <Button
            variant="ghost"
            type="button"
            className="flex h-11 w-full shrink-0 justify-between px-3 aria-expanded:rounded-b-none aria-expanded:border-b aria-expanded:[&_svg]:rotate-180 md:hidden"
            onClick={() => setSheet(!sheet)}
            data-map-results-toggle
            aria-controls="atlas-list"
            aria-expanded={sheet}
          >
            <span>
              {businesses.length} {businesses.length === 1 ? "place" : "places"}
            </span>
            <ArrowDown size={17} aria-hidden="true" />
          </Button>
          <div
            id="atlas-list"
            className="hidden min-h-0 overflow-y-auto overscroll-contain px-2 pb-2 group-data-[expanded=true]:block md:block"
          >
            <p
              className="px-2 py-3 text-xs font-medium text-muted-foreground"
              aria-live="polite"
            >
              {businesses.length} {businesses.length === 1 ? "place" : "places"}{" "}
              in this search
            </p>
            {status === "unavailable" && (
              <p className="px-2 pb-2 text-sm text-muted-foreground">
                Map unavailable. You can still open any listing below.
              </p>
            )}
            {!businesses.length && (
              <p className="px-2 pb-2 text-sm text-muted-foreground">
                Try another name, category, or barangay.
              </p>
            )}
            {businesses.map((b) => {
              const Icon = icons[b.category] ?? MapPin;
              return (
                <Button
                  variant="ghost"
                  key={b.slug}
                  type="button"
                  className="group/result grid h-auto min-h-14 w-full grid-cols-[auto_minmax(0,1fr)_auto] justify-items-start gap-2 border-b p-2 text-left whitespace-normal last:border-0 aria-pressed:bg-accent [&_strong]:block [&_strong]:leading-tight [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:text-muted-foreground"
                  data-map-result={b.slug}
                  aria-pressed={selected === b.slug}
                  onClick={() => select(b)}
                >
                  <span
                    className={"grid size-8 place-items-center rounded-md bg-accent text-primary group-aria-pressed/result:bg-primary group-aria-pressed/result:text-primary-foreground".trim()}
                  >
                    <Icon size={17} strokeWidth={1.65} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{b.name}</strong>
                    <small>
                      {[b.category_label, b.barangay]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Button>
              );
            })}
          </div>
        </div>
      </aside>
      {status === "loading" && (
        <div
          className="absolute top-[57%] left-1/2 w-max max-w-[85%] -translate-x-1/2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm md:left-2/3"
          role="status"
        >
          Loading map…
        </div>
      )}
      {status === "ready" && (
        <Button
          variant="ghost"
          className="absolute top-73 right-3 z-5 grid size-10 place-items-center border bg-card shadow-md md:top-27 md:right-5"
          type="button"
          aria-label="Reset map to Davao City"
          title="Reset map to Davao City"
          onClick={() =>
            map.current?.fitBounds(cityBounds, {
              padding: fitPadding(matchMedia("(max-width: 767px)").matches),
              duration: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? 0
                : 360,
            })
          }
        >
          <LocateFixed size={20} aria-hidden="true" />
        </Button>
      )}
      {picked && (
        <article
          className="absolute inset-x-3 bottom-7 z-20 grid grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-xl border bg-card shadow-lg md:inset-x-auto md:right-5 md:bottom-9 md:block md:w-64 [&>img]:h-full [&>img]:w-full [&>img]:object-cover md:[&>img]:h-27"
          aria-labelledby="atlas-listing-title"
        >
          <img
            src={"/art/" + art[picked.category] + ".jpg"}
            alt=""
            width={264}
            height={108}
          />
          <Button
            variant="ghost"
            type="button"
            className="absolute top-2 right-2 size-8 bg-card"
            aria-label="Close listing preview"
            onClick={() => {
              const button = results.current?.querySelector<HTMLButtonElement>(
                "[data-map-result][aria-pressed='true']",
              );
              select();
              if (matchMedia("(max-width: 767px)").matches) {
                setSheet(true);
                requestAnimationFrame(() =>
                  results.current
                    ?.querySelector<HTMLButtonElement>(
                      "[data-map-results-toggle]",
                    )
                    ?.focus(),
                );
              } else {
                button?.focus();
              }
            }}
          >
            <X size={18} aria-hidden="true" />
          </Button>
          <div className="p-3 pr-10 md:pr-3 [&>p]:text-xs [&>p]:text-muted-foreground [&>h2]:mt-1 [&>h2]:mb-2 [&>h2]:text-lg [&>h2]:leading-tight [&>h2]:font-semibold">
            <p>
              {picked.category_label} · {picked.barangay || picked.city}
              {picked.is_fixture && (
                <Badge variant="outline" className="ml-1.5">Sample listing</Badge>
              )}
            </p>
            <h2 id="atlas-listing-title" tabIndex={-1}>
              {picked.name}
            </h2>
            <p className="mb-2">Illustrative category photo</p>
            <Button asChild>
              <Link href={"/businesses/" + picked.slug}>
                Open listing <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            {picked.accepting_requests && (
              <Link
                className="mt-2 block text-sm font-medium text-primary underline-offset-4 hover:underline"
                href={"/businesses/" + picked.slug + "/book"}
              >
                {primary[picked.action]}
              </Link>
            )}
          </div>
        </article>
      )}
      <div className="absolute right-2 bottom-0 z-5 max-w-[calc(100%-1rem)] rounded-sm bg-card px-1.5 py-0.5 text-[0.65rem] text-muted-foreground hover:[&_a]:underline">
        <a href="https://www.openstreetmap.org/copyright">
          © OpenStreetMap contributors
        </a>
        <span> · </span>
        <a href="https://openfreemap.org/">OpenFreeMap</a>
        <span> · </span>
        <a href="https://openmaptiles.org/">OpenMapTiles</a>
      </div>
      <noscript>
        <p className="absolute top-[57%] left-1/2 w-max max-w-[85%] -translate-x-1/2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm md:left-2/3">
          Use List view to browse the directory without JavaScript.
        </p>
      </noscript>
    </section>
  );
}
