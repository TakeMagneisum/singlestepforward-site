(function () {
  "use strict";

  const storageKey = "ssf-language";
  const es = new Map(Object.entries({
    "Before you travel":"Antes de viajar",
    "Transit directions (Google Maps)":"Cómo llegar en transporte público (Google Maps)",
    "Trip checklist":"Lista para el viaje",
    "Print checklist":"Imprimir lista",
    "Can I go today?":"¿Puedo ir hoy?",
    "Confirm that the service can see you. Ask where to go, which entrance to use, when to arrive, and whether you need an appointment, referral, or documents.":"Confirma que puedan atenderte. Pregunta adónde ir, qué entrada usar, cuándo llegar y si necesitas cita, derivación o documentos.",
    "Check how you’ll get there and get back. Ask what to do if you’re delayed.":"Comprueba cómo llegar y volver. Pregunta qué hacer si te retrasas.",
    "“Hi, I’m trying to get to your service today. Can you confirm the arrival time and entrance? Do I need an appointment? Who should I contact if I’m late?”":"«Hola, quiero acudir hoy a su servicio. ¿Puede confirmar la hora de llegada y la entrada? ¿Necesito cita? ¿Con quién hablo si me retraso?»",
    "Choose a ride and check the whole route":"Elige cómo viajar y revisa todo el trayecto",
    "Compare the bus, train, a ride arranged by the agency, and a taxi or rideshare such as Lyft or Uber where available. Ask about fare assistance before paying. For each leg, check the total cost, how to pay, transfer time, and the final walk or pickup. Check the last departure and your return trip.":"Compara el autobús, el tren, un traslado coordinado por la agencia y un taxi o servicio como Lyft o Uber, si están disponibles. Pregunta por ayuda para el pasaje antes de pagar. Revisa el costo total, cómo pagar, el tiempo para los transbordos y el tramo final a pie o en vehículo. Revisa la última salida y el viaje de regreso.",
    "If you book a rideshare, match the license plate, vehicle and driver to your booking before getting in. Confirm that the pickup point is somewhere you can wait safely.":"Si pides un auto por una aplicación, verifica que la matrícula, el vehículo y el conductor coincidan con tu reserva antes de subir. Confirma que puedas esperar con seguridad en el punto de recogida.",
    "Rideshare safety tips from Uber":"Consejos de seguridad de Uber",
    "Find your stop and make the transfer":"Encuentra tu parada y haz el transbordo",
    "Write down the route number, direction or final destination shown on the vehicle, transfer point, and exact stop name. Ask the driver for a heads-up if you’re unsure. If you miss the stop, ask where you can safely get off and reconnect. If you miss a transfer, check the next departure and call ahead if your arrival time changes.":"Anota el número de la ruta, el sentido o destino final que aparece en el vehículo, el punto de transbordo y el nombre exacto de la parada. Si tienes dudas, pide al conductor que te avise. Si te pasas de parada, pregunta dónde puedes bajar y retomar el trayecto con seguridad. Si pierdes un transbordo, revisa la próxima salida y avisa si cambia tu hora de llegada.",
    "Travel with a child or an animal":"Viaja con un niño o un animal",
    "Ask each operator what you need for a baby or child, including car-seat arrangements, a stroller, and any ticket requirements. For a pet, ask about carriers, fees, and reservations. Service animals may follow different rules from pets. Confirm that both the transport operator and the receiving service can accommodate you.":"Pregunta a cada operador qué necesitas para viajar con un bebé o un niño, incluidos el asiento infantil, el cochecito y el boleto. Para una mascota, pregunta por el transportín, las tarifas y las reservas. Los animales de servicio pueden tener reglas distintas de las mascotas. Confirma qué pueden ofrecerte tanto el operador como el servicio que te recibe.",
    "US example: Amtrak travel policies":"Ejemplo de EE. UU.: políticas de viaje de Amtrak",
    "Ask for language or accessibility support":"Pide apoyo lingüístico o de accesibilidad",
    "Show this line and say or point to the name of your language.":"Muestra esta frase y di o señala el nombre de tu idioma.",
    "“I speak ___. I need an interpreter. Can you tell me where to go and what to do next?”":"«Hablo ___. Necesito un intérprete. ¿Puede decirme adónde ir y qué hacer después?»",
    "Ask whether each leg has step-free boarding, room for mobility equipment, a seat or a place to wait, and staff who can help. Keep any medication you may need accessible. Ask your pharmacist ahead of time if a delay could affect dosing or storage.":"Pregunta si en cada tramo puedes subir sin escalones, si hay espacio para tu equipo de movilidad, un asiento o un lugar para esperar, y personal que pueda ayudarte. Ten a mano los medicamentos que puedas necesitar. Consulta antes con tu farmacéutico si un retraso podría afectar la dosis o la conservación.",
    "Plan for weather, delays, and a phone outage":"Prepárate para el mal tiempo, los retrasos y la pérdida de servicio telefónico",
    "Check official weather and operator alerts before leaving. If the road or path is flooded, stop and find a safe alternative. Write down your next stop, a safe callback number, and a staffed place to ask for help, charge your phone, or use Wi-Fi if your battery or service runs out. Keep the paper only if it is safe to carry.":"Revisa los avisos oficiales del tiempo y del operador antes de salir. Si la carretera o el camino está inundado, detente y busca una alternativa segura. Anota tu próxima parada, un número seguro para devolver la llamada y un lugar con personal donde pedir ayuda, cargar el teléfono o usar Wi-Fi si te quedas sin batería o sin servicio. Guarda el papel solo si es seguro llevarlo.",
    "US example: National Weather Service flood guidance":"Ejemplo de EE. UU.: guía sobre inundaciones del Servicio Meteorológico Nacional",
    "Plan a safe arrival at a confidential service":"Coordina una llegada segura a un servicio confidencial",
    "Ask an advocate how and where to meet, whether a safer device would help, and how to arrange the trip if someone may monitor your phone or accounts. Ask them about safe pickup, a child or pet, and a way to reach you. Leave confidential destinations off maps and printed plans.":"Pregunta a una persona de apoyo cómo y dónde reunirse, si conviene usar un dispositivo más seguro y cómo organizar el viaje si alguien puede vigilar tu teléfono o tus cuentas. Consulta por una recogida segura, por tu niño o mascota y por una forma segura de contactarte. Deja los destinos confidenciales fuera de mapas y planes impresos.",
    "US example: internet safety for survivors":"Ejemplo de EE. UU.: seguridad en internet para sobrevivientes",
    "Write only what is safe to carry. Confirm intake and check travel alerts before leaving.":"Anota solo lo que sea seguro llevar. Confirma la atención y consulta los avisos de viaje antes de salir.",
    "Arrival time and public entrance":"Hora de llegada y entrada pública",
    "Route, direction, and stop":"Ruta, sentido y parada",
    "Transfer point and next departure":"Punto de transbordo y próxima salida",
    "Safe callback number":"Número seguro para devolver la llamada",
    "Backup ride or staffed place to ask for help":"Traslado alternativo o lugar con personal donde pedir ayuda",
    "Fare, payment, and return plan":"Tarifa, pago y plan de regreso",
    "Add to print sheet":"Añadir a la hoja para imprimir",
    "Review sheet":"Revisar la hoja",
    "Your resource sheet":"Su hoja de recursos",
    "Back to directory":"Volver al directorio",
    "Clear sheet":"Vaciar la hoja",
    "Remove":"Quitar",
    "Print or save PDF":"Imprimir o guardar como PDF",
    "Before you call or visit":"Antes de llamar o acudir",
    "Include Dawn and a QR link to Single Step Forward on this sheet":"Incluir a Dawn y un enlace QR a Single Step Forward en esta hoja",
    "Links, phone numbers, hours and availability can change. If you can, call before making a trip.":"Los enlaces, los teléfonos, los horarios y la disponibilidad pueden cambiar. Si puede, llame antes de salir.",
    "“I’m looking for help with ___. Is this the right place? What should I do first?” If they can’t help, ask “Who would you suggest I contact next?”":"«Busco ayuda con ___. ¿Es este el lugar indicado? ¿Qué debo hacer primero?» Si no pueden ayudarle, pregunte «¿Con quién más podría comunicarme?»",
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
    "View the Greater London map":"Ver el mapa del Gran Londres",
    "All US guides":"Todas las guías de EE. UU.",
    "Clear place search":"Borrar la búsqueda por lugar",
    "Find a state":"Buscar un estado",
    "No matching states.":"No hay estados que coincidan.",
    "Gold shows states with local guides.":"El color dorado indica estados con guías locales.",
    "World map":"Mapa mundial",
    "Caribbean":"Caribe",
    "Explore the Caribbean":"Explorar el Caribe",
    "Back to world map":"Volver al mapa mundial",
    "Local guides":"Guías locales",
    "Guides cover selected local areas. Each provider lists its own service area.":"Las guías cubren determinadas áreas locales. Cada proveedor indica su propia zona de servicio.",
    "No local guides published here yet.":"Aún no hay guías locales publicadas para este lugar.",
    "Explore help by US ZIP code":"Explorar ayuda por código postal de EE. UU.",
    "Explore by map":"Explorar por mapa",
    "Choose a country or territory, or search by place name.":"Elige un país o territorio, o busca por nombre.",
    "Country or territory":"País o territorio",
    "All countries and territories":"Todos los países y territorios",
    "Search by place":"Buscar por lugar",
    "Reset filters":"Restablecer filtros",
    "No matching guides. Try another place or reset the filters.":"No hay guías que coincidan. Prueba otro lugar o restablece los filtros.",
    "Select an area on the map.":"Elige un área en el mapa.",
    "Select City of London":"Elegir la City de Londres",
    "Choose an area to open its guide. Each provider lists its own service area.":"Elige un área para abrir su guía. Cada proveedor indica su propia zona de servicio.",
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
