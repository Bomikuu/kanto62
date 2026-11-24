import type { FilterSpecification, Map, StyleSpecification } from "mapbox-gl";

export const basemapBounds: [number, number, number, number] = [
  125.42, 6.96, 125.76, 7.22,
];
export const cityBounds: [number, number, number, number] = [
  125.555, 7.03, 125.645, 7.13,
];
export const places = [
  ["Matina", [125.577, 7.052]],
  ["Poblacion", [125.609, 7.074]],
  ["Obrero", [125.621, 7.09]],
  ["Buhangin", [125.624, 7.126]],
  ["Davao Gulf", [125.662, 7.055]],
] as const;

const light = {
  land: "#eeece4",
  green: "#c8d8bb",
  water: "#b7d6e5",
  river: "#a2cadc",
  minor: "#fbfaf5",
  main: "#fbf1d9",
  edge: "#d8c6a6",
  pin: "#2c4eca",
  stroke: "#ffffff",
  selected: "#15235a",
};
const dark = {
  land: "#242f39",
  green: "#35473e",
  water: "#162c3b",
  river: "#33566a",
  minor: "#3d4851",
  main: "#555454",
  edge: "#39424b",
  pin: "#8099ff",
  stroke: "#182339",
  selected: "#f1d18b",
};
export type MapPalette = typeof light;

export function mapPalette(prefersDark: boolean) {
  const theme = document.documentElement.dataset.theme;
  return theme === "dark" || ((theme === "system" || !theme) && prefersDark)
    ? dark
    : light;
}

export function baseStyle(p: MapPalette): StyleSpecification {
  // The local Davao extract comes from OpenFreeMap/OpenMapTiles and OpenStreetMap.
  const major: FilterSpecification = [
    "all",
    ["==", ["get", "layer"], "transportation"],
    ["in", ["get", "class"], ["literal", ["trunk", "primary", "secondary"]]],
  ];
  return {
    version: 8,
    sources: {
      davao: {
        type: "geojson",
        data: "/maps/davao.geojson",
        attribution:
          "© OpenStreetMap contributors · OpenFreeMap / OpenMapTiles",
      },
    },
    layers: [
      {
        id: "atlas-land",
        type: "background",
        paint: { "background-color": p.land },
      },
      {
        id: "atlas-green",
        type: "fill",
        source: "davao",
        filter: ["in", ["get", "layer"], ["literal", ["landcover", "park"]]],
        paint: { "fill-color": p.green },
      },
      {
        id: "atlas-water",
        type: "fill",
        source: "davao",
        filter: ["==", ["get", "layer"], "water"],
        paint: { "fill-color": p.water },
      },
      {
        id: "atlas-river",
        type: "line",
        source: "davao",
        filter: ["==", ["get", "layer"], "waterway"],
        paint: {
          "line-color": p.river,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 15, 2.1],
        },
      },
      {
        id: "atlas-street",
        type: "line",
        source: "davao",
        filter: ["==", ["get", "layer"], "transportation"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": p.minor,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.45,
            14,
            2.8,
            16,
            5.1,
          ],
        },
      },
      {
        id: "atlas-road-edge",
        type: "line",
        source: "davao",
        filter: major,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": p.edge,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            1,
            14,
            4.9,
            16,
            8.5,
          ],
        },
      },
      {
        id: "atlas-road",
        type: "line",
        source: "davao",
        filter: major,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": p.main,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.66,
            14,
            3.5,
            16,
            6.9,
          ],
        },
      },
    ],
  };
}

export function paintMap(map: Map, p: MapPalette) {
  for (const [id, property, color] of [
    ["atlas-land", "background-color", p.land],
    ["atlas-green", "fill-color", p.green],
    ["atlas-water", "fill-color", p.water],
    ["atlas-river", "line-color", p.river],
    ["atlas-street", "line-color", p.minor],
    ["atlas-road-edge", "line-color", p.edge],
    ["atlas-road", "line-color", p.main],
    ["business-dots", "circle-color", p.pin],
    ["business-dots", "circle-stroke-color", p.stroke],
    ["business-selected", "circle-color", p.selected],
    ["business-selected", "circle-stroke-color", p.stroke],
  ] as const)
    if (map.getLayer(id)) map.setPaintProperty(id, property, color);
}
