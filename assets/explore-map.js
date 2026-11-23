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
  const paths = window.SSFLondonPaths || {};
  const shapes = new Map();
  const navCountry = new URLSearchParams(location.search).get("country");
  country.value = Array.from(country.options).some(option => option.value === navCountry) ? navCountry : "";

  function select(id) {
    for (const [guide, shape] of shapes) shape.setAttribute("aria-pressed", String(guide === id));
    byId("map-selection").textContent = registry[id].label;
    byId("map-open-name").textContent = registry[id].name;
    open.href = route(id);
    open.hidden = false;
  }

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
  byId("pick-city").addEventListener("click", () => select(london.E09000001));

  function render() {
    panel.hidden = country.value !== "GB" || shapes.size !== 33;
    const terms = normalize(search.value).split(/\s+/);
    const matches = entries.filter(([, area]) =>
      (!country.value || area.country === country.value) &&
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
    byId("map-status").textContent = String(matches.length);
    byId("map-empty").hidden = matches.length !== 0;
  }
  country.addEventListener("change", render);
  search.addEventListener("input", render);
  byId("map-reset").addEventListener("click", () => {
    country.value = "";
    search.value = "";
    render();
    search.focus();
  });
  render();
})();
