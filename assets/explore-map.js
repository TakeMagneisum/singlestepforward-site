(() => {
  "use strict";
  const london = {
    "E09000001": "london-city-of-london",
    "E09000002": "london-barking-and-dagenham",
    "E09000003": "london-barnet",
    "E09000004": "london-bexley",
    "E09000005": "london-brent",
    "E09000006": "london-bromley",
    "E09000007": "london-camden",
    "E09000008": "london-croydon",
    "E09000009": "london-ealing",
    "E09000010": "london-enfield",
    "E09000011": "london-greenwich",
    "E09000012": "london-hackney",
    "E09000013": "london-hammersmith-and-fulham",
    "E09000014": "london-haringey",
    "E09000015": "london-harrow",
    "E09000016": "london-havering",
    "E09000017": "london-hillingdon",
    "E09000018": "london-hounslow",
    "E09000019": "london-islington",
    "E09000020": "london-kensington-and-chelsea",
    "E09000021": "london-kingston-upon-thames",
    "E09000022": "london-lambeth",
    "E09000023": "london-lewisham",
    "E09000024": "london-merton",
    "E09000025": "london-newham",
    "E09000026": "london-redbridge",
    "E09000027": "london-richmond-upon-thames",
    "E09000028": "london-southwark",
    "E09000029": "london-sutton",
    "E09000030": "london-tower-hamlets",
    "E09000031": "london-waltham-forest",
    "E09000032": "london-wandsworth",
    "E09000033": "london-westminster"
  };
  // Census postal codes used by the guide registry. Keep these available without geometry.
  const states = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
    CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
    DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii",
    ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
    MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
    MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
    NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
    NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
    SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
    UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
  };
  const registry = window.SSF_RESOURCE_AREAS;
  const entries = Object.entries(registry).sort((a, b) => a[1].label.localeCompare(b[1].label));
  const byId = id => document.getElementById(id);
  const country = byId("map-country");
  const search = byId("map-search");
  const list = byId("map-guides");
  const panel = byId("london-map");
  const svg = byId("borough-map");
  const hover = byId("map-hover");
  const open = byId("map-open");
  const route = id => "find-help.html?area=" + encodeURIComponent(id);
  const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const world = window.SSFWorldOverview;
  const supported = new Set(entries.map(([, area]) => area.country));
  const counts = new Map();
  for (const [, area] of entries) counts.set(area.country, (counts.get(area.country) || 0) + 1);
  const stateCounts = new Map();
  for (const [, area] of entries) {
    if (area.country === "US") stateCounts.set(area.stateCode, (stateCounts.get(area.stateCode) || 0) + 1);
  }
  const statesPanel = byId("us-map");
  const stateSearch = byId("state-search");
  let selectedState = "";
  let selectedCounty = "";
  const countySearch = byId("county-search");
  const counties = window.SSFGeorgiaCountyNames || {};
  const countyEntries = Object.entries(counties).sort((a, b) => a[1].localeCompare(b[1]));
  // City of Atlanta coverage applies only within city limits in Fulton and DeKalb.
  const countyGuides = {
    "13051": ["savannah-chatham"],
    "13089": ["atlanta"],
    "13121": ["atlanta"],
    "13179": ["liberty"]
  };
  const guidesForCounty = code => (countyGuides[code] || []).filter(id =>
    registry[id]?.country === "US" && registry[id]?.stateCode === "GA"
  );

  const names = new Map(Array.from(country.options).filter(option => option.value)
    .map(option => [option.value, option.textContent]));
  const overview = byId("overview-map");
  const overviewSvg = byId("overview-svg");
  const overviewLinks = byId("overview-links");
  const loadRequests = new Map();
  const svgNamespace = "http://www.w3.org/2000/svg";
  let region = false;
  let renderedView;
  let viewVersion = 0;

  // Script tags also work when the site ZIP is opened through file://.
  function loadMap(key, path) {
    if (window[key]) return Promise.resolve(window[key]);
    if (!loadRequests.has(key)) {
      loadRequests.set(key, new Promise(resolve => {
        const script = document.createElement("script");
        script.src = path;
        script.onload = () => resolve(window[key]);
        script.onerror = () => resolve(undefined);
        document.head.append(script);
      }));
    }
    return loadRequests.get(key);
  }

  function registerPlaces(places) {
    const additions = Object.entries(places).sort((a, b) => a[1].name.localeCompare(b[1].name));
    for (const [code, place] of additions) {
      if (names.has(code)) continue;
      names.set(code, place.name);
      const option = document.createElement("option");
      option.value = code;
      option.textContent = place.name;
      country.append(option);
    }
  }
  function registerCountryNames(labels) {
    registerPlaces(Object.fromEntries(Object.entries(labels).map(([code, name]) => [code, { name }])));
  }
  registerPlaces(world?.places || {});
  registerCountryNames(world?.islandNames || {});
  const regionNames = new Intl.DisplayNames(["en"], { type: "region", fallback: "code" });
  for (const code of supported) {
    if (!names.has(code)) registerCountryNames({ [code]: /^[A-Z]{2}$/.test(code) ? regionNames.of(code) : code });
  }

  function readURL() {
    const params = new URLSearchParams(location.search);
    const code = params.get("country") || "";
    if (/^[A-Z0-9-]{2,8}$/.test(code) && !names.has(code)) {
      registerCountryNames({ [code]: /^[A-Z]{2}$/.test(code) ? regionNames.of(code) : code });
    }
    country.value = names.has(code) ? code : "";
    const state = (params.get("state") || "").toUpperCase();
    selectedState = country.value === "US" && Object.hasOwn(states, state) ? state : "";
    const county = params.get("county") || "";
    selectedCounty = selectedState === "GA" && Object.hasOwn(counties, county) ? county : "";
    region = !country.value && params.get("region") === "caribbean";
  }

  function writeURL() {
    const url = country.value ? "?country=" + encodeURIComponent(country.value) : "explore-map.html";
    history.pushState(null, "", url);
  }

  function countryURL(code) {
    return "explore-map.html?country=" + encodeURIComponent(code);
  }

  function stateURL(code) {
    return countryURL("US") + "&state=" + code;
  }

  function renderStateLinks() {
    const value = normalize(stateSearch.value);
    const matches = Object.entries(states).filter(([code, name]) =>
      normalize(name).includes(value) || normalize(code) === value
    );
    byId("state-links").replaceChildren(...matches.map(([code, name]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = stateURL(code);
      link.textContent = name;
      const count = document.createElement("span");
      count.textContent = guideCount(stateCounts.get(code) || 0);
      item.append(link, count);
      return item;
    }));
    byId("state-search-empty").hidden = matches.length > 0;
  }

  function drawStateMap(paths) {
    const map = byId("us-map-svg");
    const element = tag => document.createElementNS(svgNamespace, tag);
    map.replaceChildren();
    for (const [code, name] of Object.entries(states)) {
      if (!paths[code]) continue;
      const link = element("a");
      link.setAttribute("href", stateURL(code));
      link.setAttribute("tabindex", "-1");
      if (stateCounts.has(code)) link.setAttribute("class", "has-guides");
      const title = element("title");
      title.textContent = name + " · " + guideCount(stateCounts.get(code) || 0);
      const shape = element("path");
      shape.setAttribute("d", paths[code]);
      link.append(title, shape);
      map.append(link);
    }
    for (const [label, x] of [["Alaska", 132], ["Hawaii", 349]]) {
      const text = element("text");
      text.setAttribute("x", x);
      text.setAttribute("y", 645);
      text.setAttribute("text-anchor", "middle");
      text.textContent = label;
      map.append(text);
    }
    byId("us-map-graphic").hidden = false;
  }

  function countyURL(code) {
    return stateURL("GA") + "&county=" + code;
  }

  function renderCountyLinks() {
    const value = normalize(countySearch.value);
    const matches = countyEntries.filter(([, name]) => normalize(name).includes(value));
    byId("county-links").replaceChildren(...matches.map(([code, name]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = countyURL(code);
      link.textContent = name;
      if (code === selectedCounty) link.setAttribute("aria-current", "location");
      const count = document.createElement("span");
      count.textContent = guideCount(guidesForCounty(code).length);
      item.append(link, count);
      return item;
    }));
    byId("county-search-empty").hidden = matches.length > 0;
  }

  function drawCountyMap({ viewBox, paths }) {
    const map = byId("ga-map-svg");
    const element = tag => document.createElementNS(svgNamespace, tag);
    map.setAttribute("viewBox", viewBox);
    map.replaceChildren();
    for (const [code, name] of countyEntries) {
      if (!paths[code]) continue;
      const link = element("a");
      link.setAttribute("href", countyURL(code));
      link.setAttribute("tabindex", "-1");
      const count = guidesForCounty(code).length;
      if (count) link.setAttribute("class", "has-guides");
      if (code === selectedCounty) link.setAttribute("aria-current", "location");
      const title = element("title");
      title.textContent = name + " · " + guideCount(count);
      const shape = element("path");
      shape.setAttribute("d", paths[code]);
      link.append(title, shape);
      map.append(link);
    }
    byId("ga-map-graphic").hidden = false;
  }

  function overviewLink(label, href, count) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    item.append(link);
    if (count) {
      const badge = document.createElement("span");
      badge.textContent = guideCount(count);
      item.append(badge);
    }
    overviewLinks.append(item);
  }

  function drawOverview(data, isCaribbean) {
    if (!data && !isCaribbean) return;
    overviewSvg.toggleAttribute("hidden", !data);
    data ||= { places: {} };
    overviewSvg.setAttribute("viewBox", isCaribbean ? "0 0 720 500" : "0 0 900 365");
    overviewSvg.replaceChildren();
    overviewLinks.replaceChildren();
    byId("overview-title").textContent = isCaribbean ? "Caribbean" : "World map";
    const drawPath = (parent, value) => {
      const shape = document.createElementNS(svgNamespace, "path");
      shape.setAttribute("d", value);
      parent.append(shape);
    };
    if (data.background) drawPath(overviewSvg, data.background);
    for (const [code, place] of Object.entries(data.places)) {
      const link = document.createElementNS(svgNamespace, "a");
      link.setAttribute("href", !isCaribbean && code === "PR" ? "explore-map.html?region=caribbean" : countryURL(code));
      link.setAttribute("tabindex", "-1");
      link.setAttribute("class", counts.has(code) ? "has-guides" : "no-guides");
      const title = document.createElementNS(svgNamespace, "title");
      title.textContent = names.get(code) || place.name;
      link.append(title);
      drawPath(link, place.path);
      overviewSvg.append(link);
    }
    if (isCaribbean) {
      overviewLink("Puerto Rico", countryURL("PR"), counts.get("PR"));
      for (const [code, place] of Object.entries(data.places).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
        if (code !== "PR") overviewLink(names.get(code) || place.name, countryURL(code), counts.get(code));
      }
    } else {
      overviewLink("Explore the Caribbean", "explore-map.html?region=caribbean");
      for (const code of supported) {
        if (code !== "PR") overviewLink(names.get(code) || code, countryURL(code), counts.get(code));
      }
    }
    overview.hidden = false;
  }

  function renderView() {
    const view = selectedCounty ? "GA:" + selectedCounty : selectedState ? "US:" + selectedState : country.value || (region ? "caribbean" : "world");
    if (view === renderedView) return;
    renderedView = view;
    const version = ++viewVersion;
    statesPanel.hidden = view !== "US";
    byId("map-back-us").hidden = !selectedState;
    if (view === "US") {
      renderStateLinks();
      loadMap("SSFUsStatePaths", "assets/maps/us-state-boundaries.js").then(paths => {
        if (version === viewVersion && paths) drawStateMap(paths);
      });
    }
    byId("ga-map").hidden = selectedState !== "GA";
    byId("map-back-ga").hidden = !selectedCounty;
    if (selectedState === "GA") {
      renderCountyLinks();
      loadMap("SSFGeorgiaCountyGeometry", "assets/maps/georgia-county-boundaries.js").then(geometry => {
        if (version === viewVersion && geometry) drawCountyMap(geometry);
      });
    }
    panel.hidden = true;
    overview.hidden = true;
    byId("map-back").hidden = view === "world";
    if (view === "world") drawOverview(world, false);
    if (view === "caribbean") {
      loadMap("SSFCaribbeanOverview", "assets/maps/caribbean-overview.js").then(data => {
        if (version !== viewVersion) return;
        if (data) registerPlaces(data.places);
        drawOverview(data, true);
      });
    }
    if (view === "GB") {
      loadMap("SSFLondonPaths", "assets/maps/london-boundaries.js").then(paths => {
        if (version !== viewVersion || !paths) return;
        if (!shapes.size) drawLondon(paths);
        panel.hidden = shapes.size !== 33;
      });
    }
  }

  function guideCount(count) {
    const spanish = document.documentElement.lang === "es";
    if (spanish) return count + (count === 1 ? " guía local" : " guías locales");
    return count + (count === 1 ? " local guide" : " local guides");
  }
  const shapes = new Map();

  function select(id) {
    for (const [guide, shape] of shapes) shape.setAttribute("aria-pressed", String(guide === id));
    byId("map-selection").textContent = registry[id].label;
    byId("map-open-name").textContent = registry[id].name;
    open.href = route(id);
    open.hidden = false;
  }

  function drawLondon(paths) {
    for (const [code, id] of Object.entries(london)) {
      if (registry[id]?.country !== "GB" || !paths[code]) continue;
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shape.setAttribute("d", paths[code]);
      shape.setAttribute("role", "button");
      shape.setAttribute("tabindex", "0");
      shape.setAttribute("aria-label", registry[id].name);
      shape.setAttribute("aria-pressed", "false");
      shape.addEventListener("click", () => select(id));
      shape.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(id); }
      });
      shape.addEventListener("pointerenter", () => { hover.textContent = registry[id].name; });
      shape.addEventListener("pointerleave", () => { hover.textContent = ""; });
      shapes.set(id, shape);
      svg.append(shape);
    }
  }
  byId("pick-city").addEventListener("click", () => select(london.E09000001));

  function render() {
    renderView();
    const selectedCountyGuides = selectedCounty ? guidesForCounty(selectedCounty) : null;
    const published = selectedCountyGuides ? selectedCountyGuides.length > 0 : selectedState ? stateCounts.has(selectedState) : !country.value || counts.has(country.value);
    const stateTitle = byId("map-state-title");
    stateTitle.textContent = selectedState ? " · " + (counties[selectedCounty] || states[selectedState]) : "";
    stateTitle.hidden = !selectedState;
    byId("map-clear-search").hidden = !search.value;
    byId("map-atlanta-scope").hidden = !selectedCountyGuides?.includes("atlanta");
    byId("map-unpublished").hidden = published;
    byId("map-coverage").hidden = !country.value || !published;
    byId("map-discover").hidden = country.value !== "US";
    const terms = normalize(search.value).split(/\s+/);
    const matches = entries.filter(([id, area]) =>
      (!selectedCountyGuides || selectedCountyGuides.includes(id)) &&
      (!country.value || area.country === country.value) &&
      (!selectedState || area.stateCode === selectedState) &&
      terms.every(term => normalize(area.label + " " + area.name).includes(term))
    );
    list.replaceChildren(...matches.map(([id, area]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = route(id);
      link.textContent = area.label;
      item.append(link);
      return item;
    }));
    byId("map-status").textContent = published ? guideCount(matches.length) : "";
    byId("map-empty").hidden = !published || matches.length !== 0;
  }
  country.addEventListener("change", () => {
    region = false;
    selectedState = "";
    selectedCounty = "";
    writeURL();
    render();
  });
  window.addEventListener("popstate", () => {
    readURL();
    render();
  });
  stateSearch.addEventListener("input", renderStateLinks);
  countySearch.addEventListener("input", renderCountyLinks);
  search.addEventListener("input", render);
  byId("map-clear-search").addEventListener("click", () => {
    search.value = "";
    render();
    search.focus();
  });
  byId("map-reset").addEventListener("click", () => {
    if (country.value || region) {
      country.value = "";
      selectedState = "";
      selectedCounty = "";
      region = false;
      writeURL();
    }
    search.value = "";
    stateSearch.value = "";
    countySearch.value = "";
    render();
    search.focus();
  });
  document.addEventListener("DOMContentLoaded", () => {
    readURL();
    render();
  }, { once: true });
})();
