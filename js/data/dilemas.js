// js/data/dilemas.js - Versión 3 Balas y 3 Intentos de Disparo

const DILEMAS_DATA = [
  {
    id: 1,
    titulo: "Fase 1 • Dilema 1: Redes y Fachadas",
    dilema: "Una pareja cercana aparenta amor en redes sociales pero oculta violencia. El entorno pide no intervenir por 'el qué dirán'. ¿Qué postura asume tu grupo?",
    opciones: [
      { texto: "Preservar las apariencias sociales y mantener el silencio.", balaGanada: "estandar" },
      { texto: "Confrontar la mentira de frente y romper la complicidad.", balaGanada: "dorada" },
      { texto: "Lanzar indirectas anónimas sin asumir compromiso.", balaGanada: "estandar" }
    ]
  },
  {
    id: 2,
    titulo: "Fase 1 • Dilema 2: Alianza con Dany",
    dilema: "En plena crisis de maltrato conyugal, el único auxilio real viene de Dany (marginado por su orientación sexual). ¿Qué valor le dan a esta alianza?",
    opciones: [
      { texto: "Quienes sufren discriminación comprenden la urgencia del auxilio mutuo.", balaGanada: "dorada" },
      { texto: "Es un vínculo utilitario que debe ocultarse para cuidar la reputación.", balaGanada: "estandar" },
      { texto: "Rechazar la ayuda para no ser juzgados por la sociedad.", balaGanada: "estandar" }
    ]
  },
  {
    id: 3,
    titulo: "Fase 1 • Dilema 3: Contrapesos de Poder",
    dilema: "Ante un agresor con poder económico e impunidad legal, la víctima adquiere clandestinamente un arma de contención. ¿Cuál es el propósito?",
    opciones: [
      { texto: "Establecer una disuasión latente que anule la ventaja de fuerza del dominador.", balaGanada: "dorada" },
      { texto: "Usarla inmediatamente para vengarse sin medir consecuencias.", balaGanada: "estandar" },
      { texto: "Aceptar las disculpas y confiar en que la violencia cesará sola.", balaGanada: "estandar" }
    ]
  }
];

// 3 Intentos Críticos de Disparo al Final
const INTENTOS_DISPARO = [
  {
    id: 1,
    momento: "Intento 1: Intento de Embestida en Automóvil",
    situación: "José Caicedo acorrala a Ana María intentando agredirla gravemente. Tienes el revólver en la mano y él ignora que está cargado.",
    feedbackDisparar: "💥 DISPARASTE: El proyectil hiere a José. Eres arrestada, sufres juzgamiento social en Barranquilla y pierdes la libertad. La violencia física te convirtió en victimaria.",
    feedbackGuardar: "🛡️ CONTENCIÓN: Mantienes el revólver a la vista sin jalar el gatillo. La sola duda de si dispararás hace retroceder al agresor. Ganaste control sin sangre."
  },
  {
    id: 2,
    momento: "Intento 2: Manipulación con Regalos y Lujos",
    situación: "Meses después, el agresor intenta comprar tu perdón llenando la casa de joyas y artículos de lujo, pero la tensión vuelve a subir.",
    feedbackDisparar: "💥 DISPARASTE: En un arranque de ira destruyes la negociación. Se rompe el contrapeso patrimonial y enfrentas represalias violentas.",
    feedbackGuardar: "🛡️ CONTENCIÓN: Guardas el revólver y aceptas la compensación material sin ceder terreno. El arma sigue siendo una amenaza latente e invisible."
  },
  {
    id: 3,
    momento: "Intento 3: Treinta Años Después",
    situación: "Tres décadas más tarde, el arma física ya no existe o está olvidada en un cajón. José Caicedo es anciano y jamás volvió a tocarte por temor.",
    feedbackDisparar: "💥 DISPARASTE: Un disparo tardío destruye tres décadas de convivencia en paz disuasoria y arruina tu vejez en los tribunales.",
    feedbackGuardar: "🛡️ CONTENCIÓN: ¡Triunfo Estratégico de Marvel Moreno! 30 años de paz, sumisión del opresor y autonomía garantizados sin haber quemado pólvora ni una sola vez."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DILEMAS_DATA, INTENTOS_DISPARO };
}
