(function () {
  "use strict";

  const storageKey = "ssf-language";
  const es = new Map(Object.entries({
    "Skip to main content":"Saltar al contenido principal",
    "Immediate danger?":"¿Peligro inmediato?",
    "Mental health or suicide crisis?":"¿Crisis de salud mental o suicidio?",
    "Call 911":"Llama al 911",
    "Call or text 988":"Llama o envía un mensaje al 988",
    "Awareness and local navigation":"Orientación y navegación local",
    "Possible next steps, wherever you live":"Posibles próximos pasos, dondequiera que vivas",
    "About":"Acerca de",
    "Explore help":"Explorar ayuda",
    "Explore anywhere":"Explorar en cualquier lugar",
    "Our standards":"Nuestros estándares",
    "Find a starting point":"Encontrar un punto de partida",
    "Reviewed local guides":"Guías locales revisadas",
    "Browse all":"Ver todo",
    "Ask Dawn":"Pregúntale a Dawn",
    "Choose a reviewed local guide":"Elige una guía local revisada",
    "Select a county or city…":"Selecciona un condado o ciudad…",
    "Open guide":"Abrir guía",
    "Country":"País",
    "Language":"Idioma",
    "Select an area, then open its source-checked local guide.":"Selecciona un área y abre su guía local verificada con fuentes.",
    "A starting point for options you may not know exist":"Un punto de partida para opciones que quizá no sabías que existían",
    "You don’t need to know the right program to start looking for help.":"No necesitas conocer el programa correcto para comenzar a buscar ayuda.",
    "Browse types of help":"Explorar tipos de ayuda",
    "— no ZIP needed":"— no necesitas código postal",
    "Use my ZIP":"Usar mi código postal",
    "No account":"Sin cuenta",
    "No tracking":"Sin rastreo",
    "Official links first":"Enlaces oficiales primero",
    "What do you need":"¿Con qué necesitas",
    "help with?":"ayuda?",
    "Dawn’s next-step guide":"Guía de próximos pasos de Dawn",
    "Friendly direction from a source-checked local directory.":"Orientación clara de un directorio local verificado con fuentes.",
    "Tell me what is going on.":"Cuéntame qué está pasando.",
    "Find a next step":"Encontrar un próximo paso",
    "PRIVATE ON THIS DEVICE":"PRIVADO EN ESTE DISPOSITIVO",
    "Immediate danger":"Peligro inmediato",
    "Mental health or suicide crisis":"Crisis de salud mental o suicidio",
    "All resources":"Todos los recursos",
    "All":"Todo",
    "Next step:":"Próximo paso:",
    "Phone:":"Teléfono:",
    "Location:":"Ubicación:",
    "Call":"Llamar",
    "Official website ↗":"Sitio oficial ↗",
    "Visit website ↗":"Visitar sitio ↗",
    "Possible next steps near":"Posibles próximos pasos cerca de",
    "your area":"tu área",
    "Learn what may exist":"Conoce lo que puede existir",
    "Enter or change your ZIP code":"Ingresa o cambia tu código postal",
    "Update":"Actualizar",
    "Enter a ZIP code to prepare local starting points.":"Ingresa un código postal para preparar puntos de partida locales.",
    "What might be worth looking for?":"¿Qué podría valer la pena investigar?",
    "Browse the topics":"Explorar los temas",
    "Add a ZIP to prepare a local search":"Añade un código postal para preparar una búsqueda local",
    "Call 211":"Llamar al 211",
    "Back to topics":"Volver a los temas",
    "Return home":"Volver al inicio",
    "Calm View":"Vista tranquila",
    "Calm View: On":"Vista tranquila: activada",
    "Thoughts feel too fast":"Los pensamientos van muy rápido",
    "Hard to tell what is real":"Es difícil saber qué es real",
    "What happens when I contact crisis support?":"¿Qué ocurre cuando contacto apoyo para una crisis?",
    "Need one quiet minute first?":"¿Necesitas primero un minuto tranquilo?",
    "A trained counselor will usually ask about immediate safety, listen, and help identify a next step. You may ask what information is private and what will happen before sharing details.":"Un consejero capacitado normalmente preguntará por la seguridad inmediata, escuchará y ayudará a identificar un próximo paso. Puedes preguntar qué información es privada y qué ocurrirá antes de compartir detalles.",
    "If there is no immediate physical danger and you want in-person help, ask whether a mobile crisis team is available and what kind of response may be sent. Availability varies by location.":"Si no hay peligro físico inmediato y deseas ayuda en persona, pregunta si hay un equipo móvil de crisis y qué tipo de respuesta podrían enviar. La disponibilidad varía según el lugar.",
    "If it is safe, place both feet on the floor. Name five things you can see, four things you can feel, and three things you can hear. Let your exhale last a little longer than your inhale.":"Si es seguro, coloca ambos pies en el suelo. Nombra cinco cosas que ves, cuatro que sientes y tres que oyes. Deja que la exhalación dure un poco más que la inhalación.",
    "This can help create a pause; it is not treatment and should not delay emergency or crisis support.":"Esto puede ayudar a crear una pausa; no es tratamiento y no debe retrasar el apoyo de emergencia o crisis.",
    "Here are a few good places to start.":"Estos son algunos buenos lugares para comenzar.",
    "Dawn matched your words to the source-checked directory below.":"Dawn relacionó tus palabras con el directorio verificado con fuentes que aparece abajo.",
    "Your matching resources are directly below this message.":"Los recursos relacionados aparecen directamente debajo de este mensaje.",
    "View matching resources":"Ver recursos relacionados",
    "Start over":"Empezar de nuevo",
    "Source-checked directory":"Directorio verificado con fuentes",
    "Trusted places to start.":"Lugares confiables para comenzar.",
    "Print this list":"Imprimir esta lista",
    "Describe your situation":"Describe tu situación",
    "Browse by topic":"Explorar por tema",
    "Development, disability & school support":"Desarrollo, discapacidad y apoyo escolar",
    "Family, seniors & caregivers":"Familia, adultos mayores y cuidadores"
  }));

  function storedLanguage() {
    try { return localStorage.getItem(storageKey) || "en"; } catch { return "en"; }
  }

  function remember(language) {
    try { localStorage.setItem(storageKey, language); } catch { /* The selector still works for this page load. */ }
  }

  function translateText(value) {
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    const core = value.trim();
    if (!core) return value;
    if (es.has(core)) return leading + es.get(core) + trailing;
    if (/^Open .+ guide$/.test(core)) return leading + core.replace(/^Open /, "Abrir la guía de ").replace(/ guide$/, "") + trailing;
    if (/^Viewing:/.test(core)) return leading + core.replace(/^Viewing:/, "Viendo:") + trailing;
    if (/^Source checked /.test(core)) return leading + core.replace(/^Source checked /, "Fuentes verificadas el ") + trailing;
    if (/^View \d+ resources?/.test(core)) return leading + core.replace(/^View /, "Ver ").replace(/ resource$/, " recurso").replace(/ resources$/, " recursos") + trailing;
    if (/^\d+ matching resources? (?:is|are) directly below this message\.$/.test(core)) {
      return leading + core.replace(/^\d+/, (count) => count).replace(/ matching resource is directly below this message\.$/, " recurso relacionado aparece directamente debajo de este mensaje.").replace(/ matching resources are directly below this message\.$/, " recursos relacionados aparecen directamente debajo de este mensaje.") + trailing;
    }
    return value;
  }

  function translateTree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentElement?.closest("script,style,option[data-i18n-skip]") || node.parentElement?.dataset.i18nOriginal) return;
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) {
        node.parentElement.dataset.i18nOriginal = node.nodeValue;
        node.nodeValue = translated;
      }
    });
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((input) => {
      if (!input.dataset.i18nPlaceholder) input.dataset.i18nPlaceholder = input.placeholder;
      const placeholders = {
        "Example: 80202":"Ejemplo: 00901",
        "Example: 31320":"Ejemplo: 00901",
        "Example: I’m behind on rent and worried about losing my apartment.":"Ejemplo: Estoy atrasado con el alquiler y me preocupa perder mi vivienda."
      };
      if (placeholders[input.placeholder]) input.placeholder = placeholders[input.placeholder];
    });
  }

  function restoreTree() {
    document.querySelectorAll("[data-i18n-original]").forEach((element) => {
      const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.nodeValue = element.dataset.i18nOriginal;
      delete element.dataset.i18nOriginal;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((input) => {
      input.placeholder = input.dataset.i18nPlaceholder;
      delete input.dataset.i18nPlaceholder;
    });
  }

  function apply(language) {
    document.documentElement.lang = language;
    if (language === "es") translateTree(document.body);
    else restoreTree();
    document.querySelectorAll("[data-language-select]").forEach((select) => { select.value = language; });
  }

  function init() {
    let language = storedLanguage();
    if (!/^(en|es)$/.test(language)) language = "en";
    apply(language);
    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.value = language;
      select.addEventListener("change", () => {
        remember(select.value);
        window.location.reload();
      });
    });
    if (language === "es") {
      const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
      })));
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
