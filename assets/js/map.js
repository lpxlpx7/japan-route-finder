// Route map under the search results. Draws the geometry that index.php
// embeds in the page, in the same style as Jurina API's own map page:
// purple airways, grey dotted SID/STAR connections, dark waypoint labels,
// teal airports and airway names along the line.
window.RouteMap = (() => {
  const BASEMAPS = {
    gsi: {
      label: "mapBaseGsi",
      url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
      maxNativeZoom: 18,
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>',
    },
    osm: {
      label: "mapBaseOsm",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxNativeZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    },
    dark: {
      label: "mapBaseDark",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      maxNativeZoom: 16,
      attribution: 'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> | Esri, HERE, Garmin, (c) OpenStreetMap contributors',
    },
  };
  const BASEMAP_KEY = "route-basemap";
  const MINOR_LABEL_ZOOM = 8;

  const SVG = {
    airport: '<svg width="16" height="16" viewBox="-8 -8 16 16"><circle class="apt" r="6" stroke-width="3"/></svg>',
    VOR: '<svg width="16" height="16" viewBox="-8 -8 16 16"><polygon class="body" points="6,0 3,5.2 -3,5.2 -6,0 -3,-5.2 3,-5.2" stroke-width="1.6" stroke-linejoin="round"/><circle class="dot" r="1.4"/></svg>',
    NDB: '<svg width="14" height="14" viewBox="-7 -7 14 14"><circle class="ndb" r="5" stroke-width="1.6" stroke-dasharray="1.6 1.4"/><circle class="ndb-dot" r="1.6"/></svg>',
    fix: '<svg width="12" height="12" viewBox="-6 -6 12 12"><polygon class="body" points="0,-5 4.6,3.6 -4.6,3.6" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    minor: '<svg width="8" height="8" viewBox="-4 -4 8 8"><polygon class="body" points="0,-3.2 3,2.4 -3,2.4" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  };

  let state = null; // { card, element, map, items, current, layers, ... } for the mounted results
  let translate = (key) => key;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const isDark = () => document.documentElement.dataset.theme === "dark";
  const savedBasemap = () => { try { return localStorage.getItem(BASEMAP_KEY); } catch (error) { return null; } };

  // Direction from a to b in degrees, 0 = east, 90 = north (locally flat).
  const direction = (a, b) => Math.atan2(b.lat - a.lat, (b.lon - a.lon) * Math.cos(a.lat * Math.PI / 180)) * 180 / Math.PI;
  const angleGap = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);

  const symbolFor = (point) => {
    if (point.kind === "airport") return SVG.airport;
    if (point.kind === "VOR" || point.kind === "NDB") return SVG[point.kind];
    return point.major ? SVG.fix : SVG.minor;
  };

  // Put the name on the side least covered by route lines at this point.
  const labelSide = (points, legs, index) => {
    const dirs = [];
    legs.forEach((leg) => {
      if (leg.from === index) dirs.push(direction(points[index], points[leg.to]));
      if (leg.to === index) dirs.push(direction(points[index], points[leg.from]));
    });
    let best = "up", bestGap = -1;
    [["up", 90], ["right", 0], ["down", 270], ["left", 180]].forEach(([side, angle]) => {
      const gap = dirs.length ? Math.min(...dirs.map((d) => angleGap(d, angle))) : 180;
      if (gap > bestGap + 1) { best = side; bestGap = gap; }
    });
    return best;
  };

  const lineStyle = (enroute) => enroute
    ? { color: cssVar("--map-route"), weight: 4, opacity: 0.95, lineCap: "round", lineJoin: "round" }
    : { color: cssVar("--map-proc"), weight: 2, opacity: 0.85, dashArray: "2 7", lineCap: "round" };

  // ---------- Basemap and controls ----------
  const basemapKey = () => {
    const saved = savedBasemap();
    return BASEMAPS[saved] ? saved : (isDark() ? "dark" : "gsi");
  };

  const buildControls = () => {
    const { map } = state;
    state.layerControl?.remove();
    state.zoomControl?.remove();
    const named = {};
    Object.entries(state.tiles).forEach(([key, layer]) => { named[translate(BASEMAPS[key].label)] = layer; });
    state.layerControl = L.control.layers(named, null, { position: "topright" }).addTo(map);
    state.zoomControl = L.control.zoom({ position: "topright", zoomInTitle: translate("mapZoomIn"), zoomOutTitle: translate("mapZoomOut") }).addTo(map);
  };

  const showBasemap = (key) => {
    Object.entries(state.tiles).forEach(([name, layer]) => {
      if (name === key) layer.addTo(state.map); else layer.remove();
    });
  };

  // ---------- Drawing ----------
  const draw = (geometry) => {
    const { map, routeLayer } = state;
    routeLayer.clearLayers();
    state.labels = [];
    state.lines = [];
    state.current = geometry;
    if (!geometry) return;
    const { points, legs } = geometry;
    legs.forEach((leg) => {
      const a = points[leg.from], b = points[leg.to];
      const enroute = leg.airway !== "";
      state.lines.push({ line: L.polyline([[a.lat, a.lon], [b.lat, b.lon]], lineStyle(enroute)).addTo(routeLayer), enroute });
    });
    points.forEach((point, index) => {
      L.marker([point.lat, point.lon], {
        icon: L.divIcon({ className: "sym", html: symbolFor(point), iconSize: [0, 0] }),
        keyboard: false, title: point.ident + (point.region ? ` (${point.region})` : ""),
      }).addTo(routeLayer);
      const cls = `lbl ${labelSide(points, legs, index)}${point.kind === "airport" ? " apt" : point.major ? "" : " minor"}`;
      const label = L.marker([point.lat, point.lon], {
        icon: L.divIcon({ className: cls, html: `<span>${esc(point.ident)}</span>`, iconSize: [0, 0] }),
        interactive: false, keyboard: false,
      }).addTo(routeLayer);
      state.labels.push({ marker: label, rank: point.kind === "airport" ? 0 : point.major ? 1 : 3 });
    });
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lon])), { padding: [48, 48], maxZoom: 10 });
    drawAirwayLabels();
  };

  // One name per run of consecutive legs on the same airway, written along the
  // longest leg of the run and skipped when that leg is too short on screen.
  const drawAirwayLabels = () => {
    const { map, airwayLayer, current } = state;
    airwayLayer.clearLayers();
    if (!current) return;
    const runs = [];
    current.legs.forEach((leg) => {
      if (!leg.airway) return;
      const last = runs[runs.length - 1];
      if (last && last.airway === leg.airway && last.legs[last.legs.length - 1].to === leg.from) last.legs.push(leg);
      else runs.push({ airway: leg.airway, legs: [leg] });
    });
    runs.forEach((run) => {
      let best = null, bestLength = -1;
      run.legs.forEach((leg) => {
        const a = map.latLngToContainerPoint([current.points[leg.from].lat, current.points[leg.from].lon]);
        const b = map.latLngToContainerPoint([current.points[leg.to].lat, current.points[leg.to].lon]);
        const length = a.distanceTo(b);
        if (length > bestLength) { best = { a, b }; bestLength = length; }
      });
      if (bestLength < run.airway.length * 7 + 34) return;
      let angle = Math.atan2(best.b.y - best.a.y, best.b.x - best.a.x) * 180 / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
      const middle = map.containerPointToLatLng(L.point((best.a.x + best.b.x) / 2, (best.a.y + best.b.y) / 2));
      L.marker(middle, {
        icon: L.divIcon({ className: "awy", iconSize: [0, 0], html: `<span style="transform: translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)">${esc(run.airway)}</span>` }),
        interactive: false, keyboard: false,
      }).addTo(airwayLayer);
    });
    declutter();
  };

  // Hide names that would overlap a more important one: airports, then
  // route-string fixes, then airway names, then filled-in fixes.
  const declutter = () => {
    const items = state.labels.slice();
    state.airwayLayer.eachLayer((marker) => items.push({ marker, rank: 2 }));
    items.sort((a, b) => a.rank - b.rank);
    const placed = [];
    items.forEach((item) => {
      const node = item.marker.getElement();
      if (!node) return;
      node.classList.remove("clash");
      const span = node.firstElementChild;
      if (!span || getComputedStyle(node).display === "none") return;
      const rect = span.getBoundingClientRect();
      if (!rect.width) return;
      const hit = placed.some((q) => rect.left < q.right + 2 && rect.right > q.left - 2 && rect.top < q.bottom + 2 && rect.bottom > q.top - 2);
      if (hit && item.rank > 0) node.classList.add("clash");
      else placed.push(rect);
    });
  };

  // ---------- Public ----------
  const select = (index) => {
    if (!state) return;
    const item = state.items[index] || state.items[0];
    state.index = state.items.indexOf(item);
    state.card.querySelectorAll(".map-tabs [data-map-route]").forEach((tab) => {
      tab.setAttribute("aria-selected", String(Number(tab.dataset.mapRoute) === state.index));
    });
    state.card.querySelector(".map-route-string").textContent = item.geometry ? item.route : translate("mapNoGeometry");
    draw(item.geometry);
  };

  const unmount = () => {
    if (!state) return;
    state.map.remove();
    state = null;
  };

  // Called whenever new results are put in the page.
  const mount = (root) => {
    unmount();
    const card = root.querySelector(".map-card");
    const data = card?.querySelector(".route-map-data");
    if (!card || !data || !window.L) return;
    const element = card.querySelector(".route-map");
    const map = L.map(element, { zoomControl: false, scrollWheelZoom: false, worldCopyJump: true, maxZoom: 18, zoomSnap: 0.5 }).setView([36.5, 137.5], 5);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    const tiles = {};
    Object.entries(BASEMAPS).forEach(([key, base]) => {
      tiles[key] = L.tileLayer(base.url, { maxNativeZoom: base.maxNativeZoom, maxZoom: 18, attribution: base.attribution });
    });
    state = {
      card, element, map, tiles, items: JSON.parse(data.textContent), index: 0,
      routeLayer: L.layerGroup().addTo(map), airwayLayer: L.layerGroup().addTo(map), labels: [], lines: [], current: null,
    };
    showBasemap(basemapKey());
    buildControls();
    map.on("baselayerchange", (event) => {
      const key = Object.keys(tiles).find((name) => tiles[name] === event.layer);
      try { localStorage.setItem(BASEMAP_KEY, key); } catch (error) { /* Choice lasts for this page view. */ }
    });
    // The page scrolls past the map until someone clicks into it.
    map.on("click", () => map.scrollWheelZoom.enable());
    element.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
    const updateZoom = () => element.classList.toggle("show-minor", map.getZoom() >= MINOR_LABEL_ZOOM);
    map.on("zoomend", () => { updateZoom(); drawAirwayLabels(); });
    updateZoom();
    card.querySelectorAll("[data-map-toggle]").forEach((toggle) => toggle.addEventListener("change", () => {
      element.classList.toggle(`hide-${toggle.dataset.mapToggle}`, !toggle.checked);
      declutter();
    }));
    card.querySelector(".map-tabs")?.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-map-route]");
      if (tab) select(Number(tab.dataset.mapRoute));
    });
    select(0);
  };

  const refreshTheme = () => {
    if (!state) return;
    if (!BASEMAPS[savedBasemap()]) showBasemap(basemapKey());
    state.lines.forEach(({ line, enroute }) => line.setStyle(lineStyle(enroute)));
  };

  const refreshLanguage = (t) => {
    translate = t;
    if (!state) return;
    buildControls();
    select(state.index);
  };

  return { mount, select, refreshTheme, refreshLanguage, card: () => state?.card };
})();
