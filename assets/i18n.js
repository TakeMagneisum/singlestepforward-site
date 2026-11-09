(function () {
  "use strict";

  const storageKey = "ssf-language";
  const es = new Map(Object.entries({
    "Skip to main content":"Saltar al contenido principal",
    "Immediate danger?":"¿Peligro inmediato?",
    "Mental health or suicide crisis?":"¿Crisis de salud mental o suicidio?",
    "Mental health or suicide crisis? Call or text":"¿Crisis de salud mental o suicidio? Llama o envía un mensaje al",
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
    "Immediate support":"Apoyo inmediato",
    "Continue":"Continuar",
    "Emergency":"Emergencia",
    "Project":"Proyecto",
    "Explore types of help":"Explorar tipos de ayuda",
    "What this is":"Qué es esto",
    "Explore help anywhere":"Explorar ayuda en cualquier lugar",
    "Suggest a resource":"Sugerir un recurso",
    "Page not found":"Página no encontrada",
    "Let’s find another way forward.":"Busquemos otra forma de avanzar.",
    "The page you followed may have moved, but the help directory is still here.":"Es posible que la página haya cambiado de lugar, pero el directorio de ayuda sigue aquí.",
    "Find help":"Buscar ayuda",
    "Go home":"Ir al inicio",
    "Learn what may exist. Find a place to begin.":"Conoce lo que puede existir. Encuentra un punto de partida.",
    "Emergency information":"Información de emergencia",
    "Main navigation":"Navegación principal",
    "Single Step Forward home":"Inicio de Single Step Forward",
    "Accessibility and inclusion topics":"Temas de accesibilidad e inclusión",
    "Independent disability and accessibility organizations":"Organizaciones independientes de discapacidad y accesibilidad",
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
    "Family, seniors & caregivers":"Familia, adultos mayores y cuidadores",
    "Learn & include":"Aprender e incluir",
    "Accessibility & inclusion":"Accesibilidad e inclusión",
    "Accessibility basics":"Conceptos básicos de accesibilidad",
    "Learning disabilities":"Discapacidades del aprendizaje",
    "Down syndrome":"Síndrome de Down",
    "Autism & neurodiversity":"Autismo y neurodiversidad",
    "School & family advocacy":"Defensa escolar y familiar",
    "Developmental disabilities":"Discapacidades del desarrollo",
    "Understanding can remove barriers.":"Comprender puede eliminar barreras.",
    "Learn practical ways to communicate respectfully, make information easier to use, and follow disability-led and family-support organizations.":"Conoce formas prácticas de comunicarte con respeto, facilitar el uso de la información y seguir a organizaciones dirigidas por personas con discapacidad y de apoyo familiar.",
    "Access, respect, participation":"Acceso, respeto, participación",
    "Understanding reduces friction. Respect increases access.":"Comprender reduce la fricción. El respeto aumenta el acceso.",
    "A disability may affect how someone reads, communicates, learns, moves, senses, processes information, or participates. The useful response is not assumption—it is asking what access would help.":"Una discapacidad puede afectar cómo una persona lee, se comunica, aprende, se mueve, percibe, procesa información o participa. La respuesta útil no es suponer, sino preguntar qué facilitaría el acceso.",
    "Learn by topic":"Aprender por tema",
    "Everyday inclusion":"Inclusión cotidiana",
    "A practical starting point":"Un punto de partida práctico",
    "Make the next interaction easier.":"Facilita la próxima interacción.",
    "Access needs vary. These habits are useful because they make room for the person to tell you what works instead of making you guess.":"Las necesidades de acceso varían. Estos hábitos permiten que la persona diga qué le funciona, en lugar de obligarte a adivinar.",
    "Ask, do not assume.":"Pregunta, no supongas.",
    "Try: “What would make this easier to use or understand?” Respect the answer and the person’s right to decline help.":"Prueba: «¿Qué haría que esto fuera más fácil de usar o entender?». Respeta la respuesta y el derecho de la persona a rechazar ayuda.",
    "Speak to the person.":"Habla con la persona.",
    "Address the person directly, even when an interpreter, aide, family member, or support person is present.":"Dirígete directamente a la persona, aunque esté presente un intérprete, asistente, familiar o persona de apoyo.",
    "Offer more than one format.":"Ofrece más de un formato.",
    "Plain language, written steps, captions, alt text, larger text, audio, and extra processing time can remove different barriers.":"El lenguaje claro, los pasos escritos, los subtítulos, el texto alternativo, la letra grande, el audio y más tiempo para procesar pueden eliminar distintas barreras.",
    "Assume competence.":"Da por sentada la capacidad.",
    "Communication style, speech, movement, reading speed, or support needs do not reveal everything a person understands or can decide.":"El estilo de comunicación, el habla, el movimiento, la velocidad de lectura o las necesidades de apoyo no revelan todo lo que una persona comprende o puede decidir.",
    "Treat access as access.":"Trata el acceso como acceso.",
    "An accommodation is a way to participate—not an unfair advantage, a favor, or a reason for pity.":"Una adaptación es una forma de participar, no una ventaja injusta, un favor ni una razón para sentir lástima.",
    "Learn from reliable sources":"Aprende de fuentes confiables",
    "Choose a place to begin.":"Elige un punto de partida.",
    "These links lead to government, standards, disability-led, and established nonprofit sources. They are educational starting points, not diagnoses or individualized legal, medical, or school advice.":"Estos enlaces llevan a fuentes gubernamentales, normativas, dirigidas por personas con discapacidad y organizaciones sin fines de lucro establecidas. Son puntos de partida educativos, no diagnósticos ni asesoramiento legal, médico o escolar individualizado.",
    "Access & rights":"Acceso y derechos",
    "Accessibility removes barriers in information, technology, communication, buildings, services, and participation. It is essential for some people and useful for many more.":"La accesibilidad elimina barreras en la información, la tecnología, la comunicación, los edificios, los servicios y la participación. Es esencial para algunas personas y útil para muchas más.",
    "W3C: Introduction to accessibility ↗":"W3C: Introducción a la accesibilidad ↗",
    "ADA.gov plain-language topics ↗":"Temas en lenguaje claro de ADA.gov ↗",
    "UN disability-rights framework ↗":"Marco de derechos de discapacidad de la ONU ↗",
    "Reading, writing & processing":"Lectura, escritura y procesamiento",
    "Learning disabilities can affect reading, writing, math, language, organization, or information processing. They do not tell you a person’s effort, character, or overall potential.":"Las discapacidades del aprendizaje pueden afectar la lectura, la escritura, las matemáticas, el lenguaje, la organización o el procesamiento de información. No definen el esfuerzo, el carácter ni el potencial general de una persona.",
    "Learning Disabilities Association resources ↗":"Recursos de la Asociación de Discapacidades del Aprendizaje ↗",
    "International Dyslexia Association fact sheets ↗":"Hojas informativas de la Asociación Internacional de Dislexia ↗",
    "Parent Center learning-disability guide ↗":"Guía sobre discapacidades del aprendizaje del Centro para Padres ↗",
    "Language & participation":"Lenguaje y participación",
    "Down syndrome is a genetic condition, not a disease. In the United States, “person with Down syndrome” is widely preferred; avoid “suffers from,” “afflicted by,” and “Down’s.” Follow the individual’s own language preference.":"El síndrome de Down es una condición genética, no una enfermedad. En Estados Unidos se prefiere ampliamente «persona con síndrome de Down»; evita expresiones equivalentes a «sufre de» o «está afectada por». Sigue la preferencia lingüística de cada persona.",
    "NDSS preferred-language guide ↗":"Guía de lenguaje preferido de NDSS ↗",
    "NDSS resources across the lifespan ↗":"Recursos de NDSS para todas las etapas de la vida ↗",
    "Neurodiversity & self-advocacy":"Neurodiversidad y autodefensa",
    "Autism and neurodiversity":"Autismo y neurodiversidad",
    "Use the language a person prefers. Do not infer intelligence, independence, or support needs from speech, eye contact, movement, or appearance. Communication support is access.":"Usa el lenguaje que la persona prefiera. No deduzcas inteligencia, independencia o necesidades de apoyo a partir del habla, el contacto visual, el movimiento o la apariencia. El apoyo para comunicarse es acceso.",
    "Autistic Self Advocacy Network ↗":"Red de Autodefensa Autista ↗",
    "About disability-led autism advocacy ↗":"Sobre la defensa del autismo dirigida por personas con discapacidad ↗",
    "U.S. education support":"Apoyo educativo en Estados Unidos",
    "IEPs, early intervention, and family advocacy":"IEP, intervención temprana y defensa familiar",
    "Families in the United States can learn about IDEA, evaluations, early intervention, special education, and local Parent Training and Information Centers. A Parent Center can help explain the process.":"Las familias en Estados Unidos pueden informarse sobre IDEA, evaluaciones, intervención temprana, educación especial y los Centros de Capacitación e Información para Padres. Un Centro para Padres puede ayudar a explicar el proceso.",
    "U.S. Department of Education: IDEA ↗":"Departamento de Educación de EE. UU.: IDEA ↗",
    "Find a Parent Center ↗":"Encontrar un Centro para Padres ↗",
    "Choice, rights & community":"Elección, derechos y comunidad",
    "Intellectual and developmental disabilities":"Discapacidades intelectuales y del desarrollo",
    "People with intellectual and developmental disabilities have different strengths and support needs. Inclusion means access to choice, communication, community life, education, work, relationships, and self-advocacy.":"Las personas con discapacidades intelectuales y del desarrollo tienen distintas fortalezas y necesidades de apoyo. La inclusión significa acceso a la elección, la comunicación, la vida comunitaria, la educación, el trabajo, las relaciones y la autodefensa.",
    "The Arc: mission and values ↗":"The Arc: misión y valores ↗",
    "Administration for Community Living ↗":"Administración para la Vida Comunitaria ↗",
    "U.S. workplace access":"Acceso laboral en Estados Unidos",
    "Workplace accommodations":"Adaptaciones laborales",
    "A workplace accommodation can change how, where, or when work is done so a qualified person can access an employment opportunity. The Job Accommodation Network provides free, confidential guidance and examples.":"Una adaptación laboral puede cambiar cómo, dónde o cuándo se realiza el trabajo para que una persona calificada acceda a una oportunidad de empleo. La Red de Adaptaciones Laborales ofrece orientación confidencial y gratuita con ejemplos.",
    "Search accommodation ideas ↗":"Buscar ideas de adaptación ↗",
    "Employee accommodation guide ↗":"Guía de adaptaciones para empleados ↗",
    "A stronger decision rule":"Una mejor regla de decisión",
    "Include people in decisions that affect them.":"Incluye a las personas en las decisiones que les afectan.",
    "Compassion is useful when it changes behavior: listen to lived experience, preserve choice, remove barriers, and make room for self-advocacy. Awareness without participation can still leave the same barriers in place.":"La compasión es útil cuando cambia la conducta: escucha la experiencia vivida, preserva la elección, elimina barreras y crea espacio para la autodefensa. La concientización sin participación puede dejar intactas las mismas barreras.",
    "Good default:":"Buena regla general:",
    "ask what support is wanted, offer clear options, and let the person direct the next step whenever possible.":"pregunta qué apoyo se desea, ofrece opciones claras y permite que la persona dirija el siguiente paso siempre que sea posible.",
    "Keep learning":"Sigue aprendiendo",
    "Organizations worth learning from.":"Organizaciones de las que vale la pena aprender.",
    "These independent organizations provide education, advocacy, or self-advocacy resources. Single Step Forward is not affiliated with them, and inclusion here is not a donation recommendation.":"Estas organizaciones independientes ofrecen recursos educativos, de defensa o de autodefensa. Single Step Forward no está afiliado a ellas y su inclusión aquí no es una recomendación de donación.",
    "Educational source links checked November 5, 2026. Confirm current information on each organization’s website.":"Enlaces educativos verificados el 5 de noviembre de 2026. Confirma la información vigente en el sitio web de cada organización.",
    "This page is educational, not diagnostic or individualized advice.":"Esta página es educativa; no ofrece diagnósticos ni asesoramiento individualizado.",
    "It does not replace medical, legal, educational, or workplace guidance from a qualified source.":"No sustituye la orientación médica, legal, educativa o laboral de una fuente calificada.",
    "Language preferences vary across people and communities. When possible, ask the person which language and supports they prefer.":"Las preferencias lingüísticas varían entre personas y comunidades. Cuando sea posible, pregunta qué lenguaje y apoyos prefiere la persona."
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
    document.querySelectorAll("[aria-label]").forEach((element) => {
      if (!element.dataset.i18nAriaLabel) element.dataset.i18nAriaLabel = element.getAttribute("aria-label");
      element.setAttribute("aria-label", translateText(element.getAttribute("aria-label")).trim());
    });
    document.querySelectorAll("[title]").forEach((element) => {
      if (!element.dataset.i18nTitle) element.dataset.i18nTitle = element.getAttribute("title");
      element.setAttribute("title", translateText(element.getAttribute("title")).trim());
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
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", element.dataset.i18nAriaLabel);
      delete element.dataset.i18nAriaLabel;
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute("title", element.dataset.i18nTitle);
      delete element.dataset.i18nTitle;
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
