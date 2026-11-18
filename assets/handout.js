(function () {
  "use strict";
  const areas = window.SSF_RESOURCE_AREAS;
  const tray = document.getElementById("sheet-tray");
  const preview = document.getElementById("sheet-preview");
  const items = document.getElementById("sheet-items");
  const credit = document.getElementById("sheet-credit");
  const source = document.getElementById("sheet-source");
  const storageKey = "ssf-print-selection-v1";
  const selections = new Set();
  const catalog = new Map();
  const serviceKey = (area, resource) => JSON.stringify([area.id, resource.id]);
  for (const area of Object.values(areas)) {
    for (const resource of area.resources) catalog.set(serviceKey(area, resource), {area, resource});
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (Array.isArray(saved)) saved.forEach(key => { if (catalog.has(key)) selections.add(key); });
  } catch { /* Local files and private windows can restrict browser storage. */ }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function qrLink(url, name) {
    const link = element("a", "", "sheet-code");
    link.href = new URL(url).href;
    link.setAttribute("aria-label", name);
    const encoder = new window.SSFQrEncoder(0, 0); // Automatic version, medium error correction.
    encoder.addData(link.href);
    encoder.make();
    const size = encoder.getModuleCount();
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "-4 -4 " + (size + 8) + " " + (size + 8));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("shape-rendering", "crispEdges");
    const path = document.createElementNS(namespace, "path");
    const cells = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) if (encoder.isDark(y, x)) cells.push("M" + x + " " + y + "h1v1h-1z");
    }
    path.setAttribute("d", cells.join(""));
    path.setAttribute("fill", "#000");
    svg.append(path);
    link.append(svg);
    return link;
  }

  function sync() {
    try {
      if (selections.size) sessionStorage.setItem(storageKey, JSON.stringify([...selections]));
      else sessionStorage.removeItem(storageKey);
    } catch { /* The sheet still works in memory. */ }
    tray.hidden = !selections.size;
    document.body.classList.toggle("has-sheet", !!selections.size);
    document.getElementById("sheet-count").textContent = document.documentElement.lang === "es"
      ? selections.size + (selections.size === 1 ? " servicio seleccionado" : " servicios seleccionados")
      : selections.size + (selections.size === 1 ? " service selected" : " services selected");
    document.querySelectorAll("input[data-sheet-key]").forEach(box => { box.checked = selections.has(box.dataset.sheetKey); });
  }

  window.SSFHandout = {choice(area, resource) {
    const key = serviceKey(area, resource);
    const label = element("label", "", "sheet-choice");
    const box = element("input");
    box.type = "checkbox";
    box.dataset.sheetKey = key;
    box.checked = selections.has(key);
    box.setAttribute("aria-label", "Add to print sheet: " + resource.title);
    box.addEventListener("change", () => {
      if (box.checked) selections.add(key);
      else selections.delete(key);
      sync();
    });
    label.append(box, document.createTextNode("Add to print sheet"));
    return label;
  }};

  function entry(key) {
    const {area, resource} = catalog.get(key);
    const article = element("article", "", "sheet-entry");
    const details = element("div");
    details.append(element("h2", resource.title), element("p", area.label + (resource.scope && resource.scope !== area.label ? " · " + resource.scope : ""), "sheet-meta"));
    for (const value of [resource.summary, resource.next]) {
      if (value) details.append(element("p", value));
    }
    const phone = resource.phoneDisplay || resource.phone;
    if (phone) details.append(element("p", "Phone: " + phone));
    if (resource.address) details.append(element("p", "Location: " + resource.address));
    const link = element("a", resource.url);
    link.href = resource.url;
    details.append(link, element("p", "Guide source check: " + area.reviewed, "sheet-meta"));
    const remove = element("button", "Remove", "sheet-remove");
    remove.type = "button";
    remove.setAttribute("aria-label", "Remove " + resource.title);
    remove.addEventListener("click", () => {
      const next = article.nextElementSibling || article.previousElementSibling;
      selections.delete(key);
      article.remove();
      sync();
      if (!selections.size) leave();
      else next.querySelector("button").focus();
    });
    details.append(remove);
    article.append(details, qrLink(resource.url, "Open " + resource.title));
    return article;
  }

  function updateCredit() {
    source.replaceChildren();
    source.hidden = !credit.checked;
    if (!credit.checked) return;
    const dawn = element("img");
    dawn.src = "assets/dawn-portait.webp";
    dawn.alt = "";
    const url = "https://singlestepforward.com/before-you-call.html";
    const text = element("div");
    const link = element("a", "singlestepforward.com/before-you-call.html");
    link.href = url;
    text.append(element("strong", "Single Step Forward · Before you call or visit"), link);
    source.append(dawn, text, qrLink(url, "Open Before you call or visit"));
  }

  let previousScroll = 0;
  function leave() {
    document.body.classList.remove("reviewing-sheet");
    preview.hidden = true;
    document.title = preview.dataset.previousTitle;
    items.replaceChildren();
    credit.checked = false;
    updateCredit();
    window.scrollTo(0, previousScroll);
    const target = selections.size ? document.getElementById("sheet-review") : document.querySelector(".sheet-choice input");
    target?.focus({preventScroll: true});
  }
  document.getElementById("sheet-review").addEventListener("click", () => {
    if (!selections.size) return;
    previousScroll = window.scrollY;
    preview.dataset.previousTitle = document.title;
    document.title = "Resource sheet";
    items.replaceChildren(...Array.from(selections, entry));
    credit.checked = false;
    updateCredit();
    preview.hidden = false;
    document.body.classList.add("reviewing-sheet");
    document.getElementById("sheet-title").focus();
    window.scrollTo(0, 0);
  });
  document.getElementById("sheet-back").addEventListener("click", leave);
  document.getElementById("sheet-print").addEventListener("click", () => window.print());
  document.getElementById("sheet-clear").addEventListener("click", () => { selections.clear(); sync(); leave(); });
  credit.addEventListener("change", updateCredit);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !preview.hidden) leave(); });
  sync();
})();
