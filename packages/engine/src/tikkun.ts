/**
 * Deterministic Kabbalistic Tikkun Calculation (Rav P.S. Berg SSoT)
 * Evaluates soul rectification from North Node Tropical Longitude
 * 100% deterministic TypeScript - Zero external API costs.
 */

export interface TikkunResult {
  sign: string;
  degree: number;
  northNodeHouse: number;
  title: string;
  southNodeSign: string;
  karmicInertia: string;
  soulMission: string;
  bergPrescription: string;
}

const TIKKUN_CATALOG: Record<string, {
  title: string;
  southNodeSign: string;
  karmicInertia: string;
  soulMission: string;
  bergPrescription: string;
}> = {
  Aries: {
    title: "Tikkun en Aries",
    southNodeSign: "Libra",
    karmicInertia: "Indecisión paralizante, dependencia afectiva, complacencia por evitar el conflicto y pérdida de identidad en el otro.",
    soulMission: "Forjar autonomía soberana, coraje pionero, autoafirmación espiritual y liderazgo sin necesidad de aprobación ajena.",
    bergPrescription: "Actuar con convicción propia sin suplicar consenso externo; asumir el riesgo de ser el primero.",
  },
  Taurus: {
    title: "Tikkun en Tauro",
    southNodeSign: "Scorpio",
    karmicInertia: "Drama destructivo, sospecha constante, manipulación sutil, rencor acumulado y miedo al vacío.",
    soulMission: "Construir paz interior inquebrantable, valor tangible, aprecio por la simplicidad, nutrición estética y certeza espiritual.",
    bergPrescription: "Cultivar la calma, honrar el cuerpo físico y anclar la abundancia en la estabilidad y el agradecimiento.",
  },
  Gemini: {
    title: "Tikkun en Géminis",
    southNodeSign: "Sagittarius",
    karmicInertia: "Arrogancia dogmática, desconexión de la realidad inmediata, fanatismo ideológico y prédica vacía.",
    soulMission: "Desarrollar humildad intelectual, escucha activa, comunicación transparente, versatilidad y servicio al entorno próximo.",
    bergPrescription: "Aprender a escuchar antes de pontificar; transformar teorías abstractas en diálogo constructivo cotidiano.",
  },
  Cancer: {
    title: "Tikkun en Cáncer",
    southNodeSign: "Capricorn",
    karmicInertia: "Frialdad emocional, obsesión por el estatus social, dureza juiciosa y rechazo de la vulnerabilidad.",
    soulMission: "Abrir el corazón a la ternura, cultivar la nutrición afectiva, honrar el hogar interior y abrazar la sensibilidad empática.",
    bergPrescription: "Reemplazar el control autoritario por contención emocional genuina; priorizar el vínculo humano sobre el cargo.",
  },
  Leo: {
    title: "Tikkun en Leo",
    southNodeSign: "Aquarius",
    karmicInertia: "Distanciamiento intelectual frío, rebelión estéril sin causa, anonimato defensivo y aislamiento en el grupo.",
    soulMission: "Asumir liderazgo cálido y generoso, proyectar la luz de autor, gozar la creatividad propia y compartir con orgullo noble.",
    bergPrescription: "Dar un paso al frente con el corazón abierto; irradiar magnetismo personal sin arrogancia.",
  },
  Virgo: {
    title: "Tikkun en Virgo",
    southNodeSign: "Pisces",
    karmicInertia: "Victimización afectiva, evasión en fantasías o adicciones, confusión caótica y falta de anclaje práctico.",
    soulMission: "Aplicar discernimiento riguroso, disciplina cotidiana, orden metodológico, hábitos saludables y servicio altruista concreto.",
    bergPrescription: "Ordenar el plano material; traducir la intuición espiritual en sistemas y procesos limpios.",
  },
  Libra: {
    title: "Tikkun en Libra",
    southNodeSign: "Aries",
    karmicInertia: "Impulsividad egocéntrica, agresividad reactiva, imposición tiránica del deseo individual y soledad combativa.",
    soulMission: "Aprender el arte del compromiso sagrado, la diplomacia equitativa, la justicia relacional y la co-creación en pareja.",
    bergPrescription: "Considerar el impacto de tus actos en el prójimo; construir alianzas donde ambos ganen.",
  },
  Scorpio: {
    title: "Tikkun en Escorpio",
    southNodeSign: "Taurus",
    karmicInertia: "Aferramiento a la seguridad material complaciente, resistencia al cambio, pereza espiritual y hedonismo rígido.",
    soulMission: "Abrazar la metamorfosis interior, soltar el control de las formas efímeras, profundizar en los misterios del alma y compartir recursos.",
    bergPrescription: "Aceptar la transformación radical y el renacimiento espiritual sobre la acumulación pasiva.",
  },
  Sagittarius: {
    title: "Tikkun en Sagitario",
    southNodeSign: "Gemini",
    karmicInertia: "Dispersión mental, chisme, superficialidad, escepticismo cínico y acumulación inútil de datos sin sabiduría.",
    soulMission: "Sintetizar la verdad superior, encontrar propósito vital, cultivar la fe cósmica, viajar hacia horizontes amplios y enseñar con visión.",
    bergPrescription: "Elevar el conocimiento a sabiduría; comprometerse con una verdad trascendente que inspire.",
  },
  Capricorn: {
    title: "Tikkun en Capricornio",
    southNodeSign: "Cancer",
    karmicInertia: "Dependencia infantil del clan, chantaje emocional, inmadurez afectiva y refugio temeroso en el pasado.",
    soulMission: "Asumir responsabilidad madura de la propia vida, forjar autoridad moral, sostener estructuras duraderas y lograr autosuficiencia.",
    bergPrescription: "Madurar emocionalmente; ser el pilar inquebrantable de tu propio destino sin culpar a la familia o al pasado.",
  },
  Aquarius: {
    title: "Tikkun en Acuario",
    southNodeSign: "Leo",
    karmicInertia: "Necesidad adictiva de aplauso y adulación, egocentrismo dramático, autoritarismo monárquico y orgullo herido.",
    soulMission: "Poner los dones creativos al servicio de causas colectivas, abrazar la igualdad humana, democratizar el talento e innovar para la comunidad.",
    bergPrescription: "Usar tu brillo no para alimentar el ego, sino para iluminar el camino de un colectivo más amplio.",
  },
  Pisces: {
    title: "Tikkun en Piscis",
    southNodeSign: "Virgo",
    karmicInertia: "Hipercrítica corrosiva, obsesión por el detalle insignificante, ansiedad de control microscópico y juicio rígido.",
    soulMission: "Rendirse al flujo divino, desarrollar compasión incondicional, confiar en la intuición mística y disolver la rigidez del ego en el Amor universal.",
    bergPrescription: "Soltar la necesidad compulsiva de controlarlo todo; confiar en la inteligencia infinita del cosmos.",
  },
};

const SIGNS_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function calculateTikkunBerg(northNodeLongitude: number, house: number = 1): TikkunResult {
  const normDeg = ((northNodeLongitude % 360) + 360) % 360;
  const signIndex = Math.floor(normDeg / 30);
  const degreeInSign = normDeg % 30;
  const sign = SIGNS_ORDER[signIndex] || "Aries";

  const entry = TIKKUN_CATALOG[sign] || TIKKUN_CATALOG.Aries;

  return {
    sign,
    degree: Number(degreeInSign.toFixed(2)),
    northNodeHouse: house,
    title: entry.title,
    southNodeSign: entry.southNodeSign,
    karmicInertia: entry.karmicInertia,
    soulMission: entry.soulMission,
    bergPrescription: entry.bergPrescription,
  };
}
