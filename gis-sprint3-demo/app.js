"use strict";

/**
 * Sprint 3 GIS Mapping Demo
 * - Leaflet basemap + custom GeoJSON layers (points + polygon)
 * - Styling by category
 * - Popups + hover tooltips
 * - Layer toggles
 * - Search + category filter (stretch)
 */

const statusEl = document.getElementById("status");
const searchBox = document.getElementById("searchBox");
const categorySelect = document.getElementById("categorySelect");
const btnClear = document.getElementById("btnClear");
const btnFit = document.getElementById("btnFit");

function setStatus(msg) {
  statusEl.textContent = msg;
}

// --- Map setup ---
const map = L.map("map", { zoomControl: true }).setView([43.8153, -111.7845], 15);

// Basemap (Requirement #1)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Optional second basemap (nice for demo)
const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution: '&copy; OpenTopoMap contributors'
});

// Category colors (symbology)
const categoryStyle = {
  Study:   { radius: 8, weight: 2, fillOpacity: 0.9 },
  Services:{ radius: 8, weight: 2, fillOpacity: 0.9 },
  Fitness: { radius: 8, weight: 2, fillOpacity: 0.9 },
  Parking: { radius: 8, weight: 2, fillOpacity: 0.9 },
  Default: { radius: 8, weight: 2, fillOpacity: 0.9 }
};

function pickFillColor(category) {
  switch (category) {
    case "Study": return "#4ea1ff";
    case "Services": return "#6ee7b7";
    case "Fitness": return "#fbbf24";
    case "Parking": return "#f472b6";
    default: return "#a7b1c2";
  }
}

function pointToLayer(feature, latlng) {
  const cat = feature?.properties?.category ?? "Default";
  const base = categoryStyle[cat] ?? categoryStyle.Default;

  return L.circleMarker(latlng, {
    ...base,
    color: "#0b0c10",
    fillColor: pickFillColor(cat)
  });
}

// Layers
let boundaryLayer = null;
let allPoints = [];          // raw features for filtering
let pointsLayer = null;      // Leaflet GeoJSON layer

// Helper: create popup HTML
function popupHtml(props) {
  const name = props?.name ?? "Unknown";
  const category = props?.category ?? "Uncategorized";
  const desc = props?.description ?? "";
  return `
    <div style="min-width:220px">
      <div style="font-weight:800;margin-bottom:6px">${escapeHtml(name)}</div>
      <div style="color:#60708f;margin-bottom:8px">${escapeHtml(category)}</div>
      <div>${escapeHtml(desc)}</div>
    </div>
  `;
}

// Small HTML escape for safety (demo-quality)
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Build points layer from an array of GeoJSON Features
function buildPointsLayer(features) {
  if (pointsLayer) pointsLayer.remove();

  pointsLayer = L.geoJSON(
    { type: "FeatureCollection", features },
    {
      pointToLayer,
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        // Requirement #5: Interaction (click -> popup)
        layer.bindPopup(popupHtml(props));

        // Requirement #3: readable labels (hover tooltip)
        const name = props.name ?? "Location";
        layer.bindTooltip(name, { direction: "top", offset: [0, -8], opacity: 0.95 });
      }
    }
  );

  pointsLayer.addTo(map);
}

// Update category dropdown options
function populateCategories(features) {
  const cats = new Set(features.map(f => f.properties?.category).filter(Boolean));
  // clear
  categorySelect.innerHTML = `<option value="ALL">All categories</option>`;
  [...cats].sort().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// Filter logic (stretch challenge)
function applyFilters() {
  const text = searchBox.value.trim().toLowerCase();
  const cat = categorySelect.value;

  const filtered = allPoints.filter(f => {
    const name = (f.properties?.name ?? "").toLowerCase();
    const category = (f.properties?.category ?? "");
    const nameOk = text.length === 0 || name.includes(text);
    const catOk = cat === "ALL" || category === cat;
    return nameOk && catOk;
  });

  buildPointsLayer(filtered);

  setStatus(`Showing ${filtered.length} of ${allPoints.length} locations`);
}

// Fit map to all visible data
function fitToVisibleData() {
  const groups = [];
  if (boundaryLayer) groups.push(boundaryLayer);
  if (pointsLayer) groups.push(pointsLayer);

  const fg = L.featureGroup(groups);
  const bounds = fg.getBounds();

  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.12));
  }
}

// --- Load GeoJSON data ---
async function loadGeoJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.json();
}

(async function init() {
  try {
    setStatus("Loading boundary…");
    const boundary = await loadGeoJson("data/boundary.geojson");

    // Requirement #2: custom data layer (polygon)
    boundaryLayer = L.geoJSON(boundary, {
      style: {
        color: "#4ea1ff",
        weight: 2,
        fillOpacity: 0.08
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        layer.bindPopup(`
          <div style="min-width:220px">
            <div style="font-weight:800;margin-bottom:6px">${escapeHtml(props.name ?? "Area")}</div>
            <div>${escapeHtml(props.description ?? "")}</div>
          </div>
        `);
      }
    }).addTo(map);

    setStatus("Loading points…");
    const points = await loadGeoJson("data/points.geojson");
    allPoints = points.features ?? [];

    populateCategories(allPoints);
    buildPointsLayer(allPoints);

    // Requirement #5: toggling layers with Leaflet control
    const baseMaps = { "OpenStreetMap": osm, "Topo (Optional)": topo };
    const overlayMaps = { "Boundary": boundaryLayer, "Locations": pointsLayer };
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    fitToVisibleData();
    setStatus(`Loaded ${allPoints.length} locations`);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
})();

// --- UI Events ---
searchBox.addEventListener("input", () => applyFilters());
categorySelect.addEventListener("change", () => applyFilters());

btnClear.addEventListener("click", () => {
  searchBox.value = "";
  categorySelect.value = "ALL";
  applyFilters();
  fitToVisibleData();
});

btnFit.addEventListener("click", () => fitToVisibleData());