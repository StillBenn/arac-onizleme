/* ==========================================================================
   The data the pages ask for, behind one door.
   --------------------------------------------------------------------------
   Today every answer comes from this file: a sample catalogue and a sample
   "send", so the site can be built and tried before the backend exists. When
   the real source is chosen, only the functions under "API" change — the
   pages call them and nothing else. No price is shown any more (client,
   23.11): an MZA Araç Alım expert calls within the hour with the offer; the
   catalogue's new prices stay for when a valuation is wanted again.
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

/* the choices, in the client's own words and order (23.11) */
const pairs = (list) => list.map((l) => [slug(l), l]);
export const BODIES = pairs(["Cabrio", "Coupe", "Coupe 4 kapı", "Hatchback 3 kapı", "Hatchback 5 kapı", "Sedan", "Station Wagon", "Pickup", "SUV", "Minivan", "Panelvan"]);
export const TRIMS = ["Giriş paketi", "Orta paket", "Üst paket", "Bilmiyorum"];
/* colour: name and the swatch drawn beside it */
export const COLORS = [["Siyah", "#141518"], ["Beyaz", "#f4f3ef"], ["Gri", "#8b8e93"], ["Krem", "#e6dbc3"], ["Kırmızı", "#b3261e"], ["Mavi", "#2f62ad"],
  ["Lacivert", "#1f2b47"], ["Kahverengi", "#6e4b30"], ["Sarı", "#e3b52c"], ["Turuncu", "#dc6a2a"]].map(([l, c]) => [slug(l), l, c]);
export const ENGINES = pairs(["1300 cm³'e kadar", "1301 - 1600 cm³", "1601 - 1800 cm³", "1801 - 2000 cm³", "2001 - 2500 cm³", "2501 - 3000 cm³",
  "3001 - 3500 cm³", "3501 - 4000 cm³", "4001 - 4500 cm³", "4501 - 5000 cm³", "5001 - 5500 cm³", "5501 - 6000 cm³", "6001 cm³ ve üzeri"]);
export const FUELS = pairs(["Benzin", "Benzin (LPG)", "Benzin (Hibrit)", "Dizel", "Dizel (Hibrit)", "Elektrik"]);
export const GEARS = [["otomatik", "Otomatik"], ["manuel", "Manuel"]];

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

/* Sends the application. The real call (the client's CRM, a mail, a form service) replaces this. */
export async function apply(request) {
  await wait(900);
  return { ok: true, ref: "MZA-" + String(Date.now()).slice(-6) };
}

function slug(s) {
  return s.toLocaleLowerCase("tr").replace(/[ç]/g, "c").replace(/[ğ]/g, "g").replace(/[ı]/g, "i").replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s").replace(/[ü]/g, "u").replace(/[šë]/g, (c) => ({ "š": "s", "ë": "e" })[c]).replace(/³/g, "3").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
