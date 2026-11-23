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
/* "Teklif Al" (client, 23.11): the answers go to the offer service (worker/), which numbers the form
   (MZA00001, MZA00002 …), writes it as an A4 PDF and mails it to MZA's appointed address. */
export const ENDPOINT = "https://www.mzacars.com/api/teklif";
const FIELDS = ["sid", "brand", "model", "year", "body", "trim", "color", "engine", "fuel", "gear", "km", "parts", "hasTramer", "tramer", "heavy", "name", "tel", "city", "kvkk"];
const DAMAGE = ["lokal", "boyali", "degisen"];
const label = (list, id) => (list.find(([k]) => k === id) || [])[1];
const NF = new Intl.NumberFormat("tr-TR"), fmt = (n) => NF.format(n);   /* made once: building a formatter is the slow part */

export async function apply({ car, web = "" }) {
  const body = { ...Object.fromEntries(FIELDS.map((k) => [k, car[k]])), parts: car.parts || {}, tramer: car.tramer || 0 };   /* an untouched diagram is a clean car */
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ car: body, web }), signal: ctl.signal });
    const out = await r.json().catch(() => ({}));
    return { ok: r.ok && out.ok === true };
  } catch (e) {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

/* The same answers checked on the server: every choice must be one the form offers. Returns the first problem, or "". */
export function check(c) {
  if (!c || typeof c !== "object") return "form";
  if (!/^[a-z0-9]{12,40}$/.test(String(c.sid || ""))) return "sid";
  const tel = String(c.tel || "").replace(/\D/g, "");
  const parts = c.parts && typeof c.parts === "object" && !Array.isArray(c.parts) ? c.parts : null;
  const rules = [
    ["brand", brand(c.brand)], ["model", model(c.brand, c.model)], ["year", YEARS.includes(c.year)],
    ["body", label(BODIES, c.body)], ["trim", TRIMS.includes(c.trim)], ["color", label(COLORS, c.color)],
    ["engine", label(ENGINES, c.engine)], ["fuel", label(FUELS, c.fuel)], ["gear", label(GEARS, c.gear)],
    ["km", Number.isInteger(c.km) && c.km > 0 && c.km < 2000000],
    ["parts", parts && Object.entries(parts).every(([k, v]) => label(PARTS, k) && DAMAGE.includes(v))],
    ["tramer", (c.hasTramer === "0") || (c.hasTramer === "1" && Number.isInteger(c.tramer) && c.tramer > 0 && c.tramer < 100000000)],
    ["heavy", typeof c.heavy === "boolean"],
    ["name", typeof c.name === "string" && c.name.trim().length >= 3 && c.name.trim().length <= 80 && !/[\u0000-\u001f<>]/.test(c.name)],
    ["tel", /^5\d{9}$/.test(tel)], ["city", CITIES.includes(c.city)], ["kvkk", c.kvkk === true],
  ];
  const bad = rules.find(([, ok]) => !ok);
  return bad ? bad[0] : "";
}

/* The answers in words, for the PDF and the mail: what the visitor saw, in the form's own labels. */
export function describe(c) {
  const b = brand(c.brand), m = model(c.brand, c.model), tel = String(c.tel).replace(/\D/g, "");
  const color = COLORS.find(([k]) => k === c.color);
  return {
    car: `${b.name} ${m.name}`,
    line: [c.year, label(BODIES, c.body), fmt(c.km) + " km"].join(" · "),
    damage: [Object.keys(c.parts).length ? `${Object.keys(c.parts).length} işlemli parça` : "Tüm parçalar orijinal",
      c.hasTramer === "1" ? `Tramer ${fmt(c.tramer)} ₺` : "Tramer yok", c.heavy ? "Ağır hasar var" : "Ağır hasar yok"].join(" · "),
    vehicle: [["Marka", b.name], ["Model", m.name], ["Model yılı", String(c.year)], ["Kasa tipi", label(BODIES, c.body)], ["Donanım paketi", c.trim],
      ["Renk", color[1], color[2]], ["Motor hacmi", label(ENGINES, c.engine)], ["Yakıt", label(FUELS, c.fuel)], ["Vites", label(GEARS, c.gear)],
      ["Kilometre", fmt(c.km) + " km"]],
    records: [["Tramer kaydı", c.hasTramer === "1" ? `Var · ${fmt(c.tramer)} ₺` : "Yok"], ["Ağır hasar kaydı", c.heavy ? "Var" : "Yok"]],
    parts: PARTS.filter(([id]) => c.parts[id]).map(([id, name]) => [id, name, c.parts[id], label(STATES, c.parts[id])]),
    owner: [["Ad soyad", c.name.trim().replace(/\s+/g, " ")], ["Cep telefonu", `+90 ${tel.slice(0, 3)} ${tel.slice(3, 6)} ${tel.slice(6, 8)} ${tel.slice(8)}`],
      ["Bulunduğunuz şehir", c.city], ["Aydınlatma metni", "Okundu, onaylandı"]],
  };
}

function slug(s) {
  return s.toLocaleLowerCase("tr").replace(/[ç]/g, "c").replace(/[ğ]/g, "g").replace(/[ı]/g, "i").replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s").replace(/[ü]/g, "u").replace(/[šë]/g, (c) => ({ "š": "s", "ë": "e" })[c]).replace(/³/g, "3").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
