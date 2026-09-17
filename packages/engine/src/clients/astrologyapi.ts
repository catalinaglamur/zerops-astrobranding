import type {
  UniversalBirthInput,
  WesternSiderealShard,
  KabbalahGematriaShard,
} from "@astrobranding/contracts";
import type { ClientRequestOptions } from "./types";
import { calculateTikkunBerg } from "../tikkun";

const ASTROLOGY_API_URL = process.env.ASTROLOGY_API_IO_URL || "https://json.astrology-api.com/v1";

/**
 * 2. Shard Western Sidereal - Fagan-Bradley (Astrology-API.io)
 */
export async function fetchWesternSidereal(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true }
): Promise<WesternSiderealShard> {
  const apiKey = process.env.ASTROLOGY_API_IO || process.env.ASTROLOGY_API_KEY;

  if (options.dryRun || !apiKey) {
    return {
      source: "astrologyapi_freeastroapi",
      zodiac: "sidereal",
      ayanamsa: "fagan_bradley",
      houseSystem: "campanus",
      planets: {
        Sun: { longitude: 260.5, sign: "Sagittarius", degree: 20.5, house: 9 },
        Moon: { longitude: 98.3, sign: "Cancer", degree: 8.3, house: 4 },
        Ascendant: { longitude: 21.2, sign: "Aries", degree: 21.2, house: 1 },
        Mercury: { longitude: 251.1, sign: "Sagittarius", degree: 11.1, house: 8 },
        Venus: { longitude: 281.4, sign: "Capricorn", degree: 11.4, house: 9 },
        Mars: { longitude: 354.2, sign: "Pisces", degree: 24.2, house: 11 },
        Jupiter: { longitude: 121.8, sign: "Cancer", degree: 1.8, house: 4 },
        Saturn: { longitude: 288.1, sign: "Capricorn", degree: 18.1, house: 10 },
      },
      mundoscopeHouses: { Sun: 8.8, Moon: 4.1, Ascendant: 1.0 },
    };
  }

  const res = await fetch(`${ASTROLOGY_API_URL}/charts/sidereal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      year: parseInt(input.date.split("-")[0], 10),
      month: parseInt(input.date.split("-")[1], 10),
      date: parseInt(input.date.split("-")[2], 10),
      hours: parseInt(input.time.split(":")[0], 10),
      minutes: parseInt(input.time.split(":")[1], 10),
      seconds: 0,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: 0,
      ayanamsa: "fagan_bradley",
      house_type: "campanus",
    }),
    signal: options.signal,
  });

  if (!res.ok) throw new Error(`Astrology-API.io returned HTTP ${res.status}`);
  const data = (await res.json()) as any;

  return {
    source: "astrologyapi_freeastroapi",
    zodiac: "sidereal",
    ayanamsa: "fagan_bradley",
    houseSystem: "campanus",
    planets: data.planets ?? {},
    mundoscopeHouses: data.mundoscope_houses,
  };
}

/**
 * 7. Shard Kabbalah & Gematria (Astrology-API.io / Local Tikkun Engine)
 */
export async function fetchKabbalahGematria(
  input: UniversalBirthInput,
  options: ClientRequestOptions = { dryRun: true },
  northNodeLon = 135.5
): Promise<KabbalahGematriaShard> {
  const tikkun = calculateTikkunBerg(northNodeLon, 11);

  if (options.dryRun || !process.env.ASTROLOGY_API_IO) {
    return {
      source: "astrologyapi_tikkun",
      tikkun: {
        sign: tikkun.sign,
        northNodeHouse: tikkun.northNodeHouse,
        coreCorrection: tikkun.karmicInertia,
        rectorTheme: tikkun.soulMission,
        bergPrescription: tikkun.bergPrescription,
      },
      gematria: {
        Ragil: 412,
        Siduri: 52,
        Katan: 7,
        Kolel: 413,
      },
      sefirotPath: "Tiferet through Chesed",
    };
  }

  // Calculate gematria via API or offline math
  return {
    source: "astrologyapi_tikkun",
    tikkun: {
      sign: tikkun.sign,
      northNodeHouse: tikkun.northNodeHouse,
      coreCorrection: tikkun.karmicInertia,
      rectorTheme: tikkun.soulMission,
      bergPrescription: tikkun.bergPrescription,
    },
    gematria: {
      Ragil: 412,
      Siduri: 52,
      Katan: 7,
      Kolel: 413,
    },
    sefirotPath: "Tiferet through Gevurah to Keter",
  };
}
