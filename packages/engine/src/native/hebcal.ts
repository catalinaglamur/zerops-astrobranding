import { HDate, HebrewCalendar, Location, Zmanim } from "@hebcal/core";
import type { HebrewZmanimShard } from "@astrobranding/contracts";

function formatTime(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return "--:--";
  return d.toISOString().substring(11, 16);
}

/**
 * Native Bun Hebrew Calendar & Zmanim Calculator
 * 100% offline, pure mathematical execution via @hebcal/core.
 */
export function calculateNativeHebrewZmanim(
  date: string,
  time: string,
  latitude = 40.7128,
  longitude = -74.0060,
  timezone = "UTC"
): HebrewZmanimShard {
  const [year, month, day] = date.split("-").map((v) => parseInt(v, 10));
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  // 1. Calculate Hebrew Date
  const hdate = new HDate(targetDate);
  const hebrewDate = `${hdate.render("en")} (${hdate.renderGematriya()})`;

  // 2. Resolve Parashat HaShavua for the Saturday following targetDate
  let parashat = "Weekly Torah Reading";
  try {
    const sedra = HebrewCalendar.getSedra(hdate.getFullYear(), false);
    const parshaLookup = sedra.lookup(hdate);
    if (parshaLookup?.parsha && parshaLookup.parsha.length > 0) {
      parashat = parshaLookup.parsha.join(" - ");
    }
  } catch {
    // Graceful fallback
  }

  // 3. Compute Halachic Solar Prayer Times (Zmanim)
  const loc = new Location(latitude, longitude, false, timezone);
  const zman = new Zmanim(loc, targetDate, false);

  const zmanimRecord: Record<string, string> = {
    alotHaShachar: formatTime(zman.alotHaShachar()),
    misheyakir: formatTime(zman.misheyakir()),
    sunrise: formatTime(zman.sunrise()),
    sofZmanShemaGra: formatTime(zman.sofZmanShma()),
    sofZmanTefilaGra: formatTime(zman.sofZmanTfilla()),
    chatzot: formatTime(zman.chatzot()),
    minchaGedola: formatTime(zman.minchaGedola()),
    minchaKetana: formatTime(zman.minchaKetana()),
    plagHaMincha: formatTime(zman.plagHaMincha()),
    sunset: formatTime(zman.sunset()),
    tzeitHaKochavim: formatTime(zman.tzeit()),
  };

  return {
    source: "native_bun_hebcal_core",
    hebrewDate,
    parashat,
    zmanim: zmanimRecord,
  };
}
