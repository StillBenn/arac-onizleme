/* ==========================================================================
   The data the pages ask for, behind one door.
   --------------------------------------------------------------------------
   Today every answer comes from this file: a sample catalogue and a sample
   price model, so the site can be built and tried before the backend exists.
   When the real source is chosen (a valuation API, the client's own pricing),
   only the functions under "API" change — the pages call them and nothing else.
   All prices here are SAMPLES (the preview says so on every page).
   ========================================================================== */

const NOW = 2026;
export const YEARS = Array.from({ length: NOW - 2007 }, (_, i) => NOW - i);   // 2026 … 2008

/* brand, a few current models, and each model's sample new price (thousand TL) */
const CATALOG = [
  ["Fiat", [["Egea", 1150], ["Egea Cross", 1290], ["500", 1350], ["Doblo", 1250], ["Fiorino", 980]]],
  ["Renault", [["Clio", 1420], ["Megane", 1690], ["Taliant", 1180], ["Captur", 1640], ["Austral", 2350]]],
  ["Volkswagen", [["Polo", 1520], ["Golf", 2050], ["Passat", 2650], ["T-Roc", 2150], ["Tiguan", 2900], ["Taigo", 1780]]],
  ["Toyota", [["Corolla", 1780], ["Yaris", 1480], ["C-HR", 2150], ["RAV4", 3100]]],
  ["Hyundai", [["i20", 1350], ["i10", 1120], ["Bayon", 1560], ["Tucson", 2450], ["Elantra", 1690]]],
  ["Ford", [["Focus", 1720], ["Puma", 1830], ["Kuga", 2480], ["Ranger", 2750]]],
  ["Peugeot", [["208", 1450], ["2008", 1790], ["308", 1880], ["3008", 2390], ["408", 2150]]],
  ["Dacia", [["Sandero", 990], ["Duster", 1390], ["Jogger", 1290]]],
  ["Opel", [["Corsa", 1390], ["Astra", 1750], ["Mokka", 1820], ["Grandland", 2290]]],
  ["Honda", [["Civic", 2050], ["City", 1480], ["HR-V", 2190], ["CR-V", 3050], ["Jazz", 1590]]],
  ["Škoda", [["Fabia", 1380], ["Octavia", 1980], ["Superb", 2850], ["Kamiq", 1720], ["Karoq", 2290]]],
  ["Citroën", [["C3", 1260], ["C4", 1690], ["C4 X", 1740], ["C5 Aircross", 2180]]],
  ["BMW", [["1 Serisi", 2650], ["3 Serisi", 3850], ["5 Serisi", 5400], ["X1", 3450], ["X3", 4900]]],
  ["Mercedes-Benz", [["A Serisi", 2900], ["C Serisi", 4200], ["E Serisi", 6100], ["CLA", 3400], ["GLC", 5600]]],
  ["Audi", [["A3", 2700], ["A4", 3650], ["A6", 5100], ["Q3", 3300], ["Q5", 4700]]],
  ["Nissan", [["Juke", 1690], ["Qashqai", 2190], ["X-Trail", 2790]]],
  ["Kia", [["Picanto", 1090], ["Stonic", 1490], ["Ceed", 1690], ["Sportage", 2390]]],
  ["Togg", [["T10X", 2350]]],
  ["Chery", [["Omoda 5", 1690], ["Tiggo 7 Pro", 1890], ["Tiggo 8 Pro", 2290]]],
  ["Volvo", [["S60", 3600], ["XC40", 3300], ["XC60", 4600]]],
  ["Seat · Cupra", [["Ibiza", 1450], ["Leon", 1850], ["Formentor", 2450]]],
  ["Tesla", [["Model 3", 2600], ["Model Y", 2850]]],
];
export const BRANDS = CATALOG.map(([name, models]) => ({ id: slug(name), name, models: models.map(([m, base]) => ({ id: slug(m), name: m, base })) }));
export const brand = (id) => BRANDS.find((b) => b.id === id);
export const model = (b, id) => (brand(b)?.models || []).find((m) => m.id === id);

export const FUELS = [["benzin", "Benzin"], ["dizel", "Dizel"], ["hibrit", "Hibrit"], ["elektrik", "Elektrik"], ["lpg", "Benzin + LPG"]];
export const GEARS = [["otomatik", "Otomatik"], ["manuel", "Manuel"]];
export const BODIES = [["sedan", "Sedan"], ["hatchback", "Hatchback"], ["suv", "SUV / Crossover"], ["stationwagon", "Station wagon"], ["ticari", "Hafif ticari"]];
export const TRIMS = ["Giriş paketi", "Orta paket", "Üst paket", "Bilmiyorum"];

/* the painted parts of a car, as the diagram draws them (id, name) */
export const PARTS = [
  ["on-tampon", "Ön tampon"], ["kaput", "Motor kaputu"], ["tavan", "Tavan"], ["bagaj", "Bagaj kapağı"], ["arka-tampon", "Arka tampon"],
  ["sol-on-camurluk", "Sol ön çamurluk"], ["sol-on-kapi", "Sol ön kapı"], ["sol-arka-kapi", "Sol arka kapı"], ["sol-arka-camurluk", "Sol arka çamurluk"],
  ["sag-on-camurluk", "Sağ ön çamurluk"], ["sag-on-kapi", "Sağ ön kapı"], ["sag-arka-kapi", "Sağ arka kapı"], ["sag-arka-camurluk", "Sağ arka çamurluk"],
];
export const STATES = [["orijinal", "Orijinal"], ["lokal", "Lokal boyalı"], ["boyali", "Boyalı"], ["degisen", "Değişen"]];

export const CITIES = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];

/* ---------------------------------------------------------------- API --- */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* A sample price model, only so the flow can be tried: age, kilometres, fuel and gearbox, the
   painted and replaced parts, the damage record. The real valuation replaces this function. */
export async function valuate(car) {
  await wait(1400);                                   // the real call takes a moment; the page shows it working
  const m = model(car.brand, car.model);
  const base = (m ? m.base : 1500) * 1000;
  const age = Math.max(0, NOW - car.year);
  let v = base * Math.max(0.24, Math.pow(0.885, age));
  const expected = Math.max(1, age) * 16000;
  v *= Math.min(1.06, Math.max(0.72, 1 - ((car.km || 0) - expected) / 1e6 * 0.9));
  v *= { benzin: 1, dizel: 1.02, hibrit: 1.05, elektrik: 1, lpg: 0.93 }[car.fuel] || 1;
  v *= car.gear === "manuel" ? 0.96 : 1;
  v *= { "Giriş paketi": 0.96, "Orta paket": 1, "Üst paket": 1.05 }[car.trim] || 1;
  let cut = 0;
  for (const s of Object.values(car.parts || {})) cut += { lokal: 0.01, boyali: 0.025, degisen: 0.045 }[s] || 0;
  v *= 1 - Math.min(0.4, cut);
  if (car.tramer > 0) v -= Math.min(car.tramer, v * 0.3) * 0.55;
  if (car.heavy) v *= 0.66;
  const round = (x) => Math.round(x / 5000) * 5000;
  return { low: round(v * 0.965), high: round(v * 1.035), sample: true };
}

/* Free inspection slots for the next working days (Sundays closed); a few taken. */
export async function slots(city) {
  await wait(300);
  const days = [];
  const d = new Date();
  for (let i = 1; days.length < 7; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (day.getDay() === 0) continue;
    const times = [];
    for (let h = 10; h <= 18; h++) {
      const taken = ((day.getDate() * 7 + h * 3 + (city || "").length) % 5) === 0;
      times.push({ t: `${String(h).padStart(2, "0")}:00`, taken });
    }
    days.push({ date: day, times });
  }
  return days;
}

export async function book(request) {
  await wait(900);
  return { ok: true, ref: "AU-" + String(Date.now()).slice(-6) };
}

function slug(s) {
  return s.toLocaleLowerCase("tr").replace(/[ç]/g, "c").replace(/[ğ]/g, "g").replace(/[ı]/g, "i").replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s").replace(/[ü]/g, "u").replace(/[šë]/g, (c) => ({ "š": "s", "ë": "e" })[c]).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
