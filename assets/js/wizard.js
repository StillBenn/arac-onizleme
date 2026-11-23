/* ==========================================================================
   Teklif formu — the car, one question at a time
   --------------------------------------------------------------------------
   The client's flow (23.11): brand, model, year; then body, package and
   colour on one screen; engine, fuel and gearbox on the next; kilometres;
   the condition (the diagram, the damage record); the owner (name, phone,
   city, consent); and the application. No price on screen: an MZA Araç Alım
   expert calls within the hour with the offer. Every screen ends on the same
   two buttons, "Geri" on the left and "İleri" on the right; a single choice
   also moves on by itself. The answers live in the summary card and survive
   a reload (sessionStorage); the last screen opens that card in full.
   ========================================================================== */
import { YEARS, BRANDS, brand, model, BODIES, TRIMS, COLORS, ENGINES, FUELS, GEARS, CITIES, PARTS, apply } from "./data.js";
import { mountCar } from "./car.js";
import { makePick } from "./pick.js";

const root = document.querySelector("[data-wiz]");
const screen = root.querySelector("[data-screen]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const KEY = "mza-teklif";                       /* new flow, new store: old answers (other ids) are not carried over */
const fmt = (n) => new Intl.NumberFormat("tr-TR").format(n);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ARW = '<svg class="arw" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>';
const BACK = '<svg class="arw arw--back" viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5M9 5.5 4.5 10 9 14.5"/></svg>';

/* the screens, in order; each belongs to a step */
const SCREENS = ["marka", "model", "yil", "arac", "motor", "km", "kaporta", "kayit", "iletisim", "basvuru"];
const STEP_OF = { marka: 0, model: 0, yil: 0, arac: 0, motor: 0, km: 0, kaporta: 1, kayit: 1, iletisim: 2, basvuru: 3 };

let car = load();
let at = "marka";

function load() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function save() { try { sessionStorage.setItem(KEY, JSON.stringify(car)); } catch (e) { /* private window */ } }

/* ---- the summary: the card beside the questions, and the full form on the last screen ---- */
const label = (list, id) => (list.find(([k]) => k === id) || [, id])[1];
function rows() {
  const b = brand(car.brand), m = model(car.brand, car.model);
  const damaged = Object.keys(car.parts || {}).length;
  return [
    ["Marka", b && b.name], ["Model", m && m.name], ["Model yılı", car.year],
    ["Kasa", car.body && label(BODIES, car.body)], ["Paket", car.trim], ["Renk", car.color && label(COLORS, car.color)],
    ["Motor hacmi", car.engine && label(ENGINES, car.engine)],
    ["Yakıt · vites", car.fuel && car.gear && `${label(FUELS, car.fuel)} · ${label(GEARS, car.gear)}`],
    ["Kilometre", car.km > 0 && fmt(car.km) + " km"],
    ["Kaporta", car.partsDone && (damaged ? `${damaged} parça işaretli` : "Hasarsız")],
    ["Tramer", car.recordDone && (car.tramer > 0 ? fmt(car.tramer) + " ₺" : "Yok")],
    ["Ağır hasar", car.recordDone && (car.heavy ? "Var" : "Yok")],
  ].filter(([, v]) => v);
}
const line = () => { const b = brand(car.brand), m = model(car.brand, car.model); return [b && b.name, m && m.name, car.year].filter(Boolean).join(" · "); };
const dl = (list) => list.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
function summary() {
  root.querySelector("[data-sum-rows]").innerHTML = dl(rows());
  root.querySelector("[data-sum-line]").textContent = line() || "Henüz seçim yok";
}

/* ---- steps bar ---- */
function steps() {
  const s = STEP_OF[at];
  root.querySelectorAll("[data-step]").forEach((li) => {
    const k = +li.dataset.step;
    li.classList.toggle("is-on", k === s); li.classList.toggle("is-done", k < s);
    li.querySelector("button").disabled = !(k < s) || at === "basvuru";
  });
  root.querySelector("[data-track]").style.transform = `scaleX(${(SCREENS.indexOf(at) + 1) / SCREENS.length})`;
}
root.querySelector("[data-steps]").addEventListener("click", (e) => {
  const li = e.target.closest("[data-step]");
  if (!li || li.querySelector("button").disabled) return;
  go(SCREENS.find((s) => STEP_OF[s] === +li.dataset.step), -1);
});

/* ---- moving between screens ---- */
let leaving = 0;
function go(next, dir = 1) {
  const first = !screen.firstElementChild;
  at = next;
  car.at = next;
  root.classList.toggle("is-final", next === "basvuru");   /* the last screen has no side card: it shows the whole form */
  steps(); summary(); save();
  const draw = () => {
    screen.innerHTML = `<div class="scr" data-dir="${dir}">${RENDER[next]()}</div>`;
    const scr = screen.firstElementChild;
    WIRE[next] && WIRE[next](scr);
    requestAnimationFrame(() => scr.classList.add("is-in"));
    const f = scr.querySelector("[data-focus]") || scr.querySelector("h2");
    if (f && !first) f.focus({ preventScroll: true });
    if (!first && root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  const old = screen.firstElementChild;
  clearTimeout(leaving);
  if (!old || reduced) return draw();
  old.classList.remove("is-in"); old.classList.add("is-out"); old.dataset.dir = dir;
  leaving = setTimeout(draw, 220);
}
/* the two buttons every screen ends on (client, 23.11: "Geri" and "İleri", the same colour and style, İleri on the right) */
const nav = (prev, ok, text = "İleri") => `<div class="scr__nav">${prev ? `<button class="btn btn--gold btn--back" type="button" data-back="${prev}">${BACK}Geri</button>` : "<span></span>"}<button class="btn btn--gold" type="button" data-next ${ok ? "" : "disabled"}>${text} ${ARW}</button></div>`;
screen.addEventListener("click", (e) => { const b = e.target.closest("[data-back]"); if (b) go(b.dataset.back, -1); });
const head = (q, hint) => `<h2 class="scr__q" tabindex="-1">${q}</h2>${hint ? `<p class="scr__hint">${hint}</p>` : ""}`;
const opts = (list, cur, cls = "") => list.map(([v, l]) => `<button type="button" class="opt ${cls}" data-v="${esc(v)}" aria-pressed="${String(v) === String(cur)}">${esc(l)}</button>`).join("");
const colours = (cur) => COLORS.map(([v, l, c]) => `<button type="button" class="opt opt--colour" data-v="${v}" aria-pressed="${v === cur}"><i class="swatch" style="--c:${c}" aria-hidden="true"></i>${esc(l)}</button>`).join("");
const seg = (legend, k, body, cls = "opts--row") => `<fieldset class="seg"><legend>${legend}</legend><div class="opts ${cls}" data-k="${k}">${body}</div></fieldset>`;

/* ---- the screens ---- */
const RENDER = {
  marka: () => `${head("Aracınızın Markası Nedir?")}<input class="field__input find" type="search" placeholder="Marka ara" aria-label="Marka ara" data-focus autocomplete="off"><div class="opts opts--brands" data-list>${opts(BRANDS.map((b) => [b.id, b.name]), car.brand, "opt--brand")}</div>${nav(null, !!car.brand)}`,
  model: () => `${head("Aracınızın Modeli Nedir?")}<div class="opts opts--models">${opts((brand(car.brand)?.models || []).map((m) => [m.id, m.name]), car.model, "opt--brand")}</div>${nav("marka", !!car.model)}`,
  yil: () => `${head("Aracınızın Model Yılı Nedir?")}<div class="opts opts--years">${opts(YEARS.map((y) => [y, y]), car.year, "opt--mono")}</div>${nav("model", !!car.year)}`,
  arac: () => `${head("Kasa, Donanım ve Renk")}
    ${seg("Kasa tipi", "body", opts(BODIES, car.body), "opts--grid")}
    ${seg("Donanım paketi", "trim", opts(TRIMS.map((t) => [t, t]), car.trim))}
    ${seg("Renk", "color", colours(car.color), "opts--grid")}
    ${nav("yil", car.body && car.trim && car.color)}`,
  motor: () => `${head("Motor, Yakıt ve Vites")}
    ${seg("Motor hacmi", "engine", opts(ENGINES, car.engine), "opts--grid opts--wide")}
    ${seg("Yakıt", "fuel", opts(FUELS, car.fuel))}
    ${seg("Vites", "gear", opts(GEARS, car.gear))}
    ${nav("arac", car.engine && car.fuel && car.gear)}`,
  km: () => `${head("Kilometresi Kaç?")}
    <label class="km"><input class="km__in" inputmode="numeric" autocomplete="off" aria-label="Kilometre" data-focus value="${car.km ? fmt(car.km) : ""}" placeholder="0"><span class="km__u">km</span></label>
    <input class="km__range" type="range" min="0" max="400000" step="1000" value="${car.km || 0}" aria-label="Kilometre kaydırıcı">
    <div class="km__scale" aria-hidden="true"><span>0</span><span>100 bin</span><span>200 bin</span><span>300 bin</span><span>400 bin+</span></div>
    ${nav("motor", car.km > 0)}`,
  kaporta: () => `${head("Boyalı ya da Değişen Parça Var mı?", "Parçaya dokunun, durumunu seçin. Hasarsızsa doğrudan ilerleyin.")}
    <div class="kap"><div class="car" data-car></div><div class="kap__side"><ul class="legend" role="list"><li><i class="sw sw--orijinal"></i>Orijinal</li><li><i class="sw sw--lokal"></i>Lokal boyalı</li><li><i class="sw sw--boyali"></i>Boyalı</li><li><i class="sw sw--degisen"></i>Değişen</li></ul>
    <ul class="kap__list" data-marked role="list"></ul><button class="link" type="button" data-reset hidden>Hepsini orijinal yap</button></div></div>
    ${nav("km", true)}`,
  kayit: () => `${head("Hasar Kayıtları")}
    <fieldset class="seg"><legend>Tramer kaydı</legend><div class="opts opts--row" data-k="hasTramer">${opts([["0", "Yok"], ["1", "Var"]], car.hasTramer)}</div>
      <div class="expand${car.hasTramer === "1" ? " is-open" : ""}" data-tramer${car.hasTramer === "1" ? "" : " inert"}><div><label class="field field--sub"><span class="field__l">Toplam tramer tutarı</span><span class="money"><input class="field__input" inputmode="numeric" data-tramer-in value="${car.tramer ? fmt(car.tramer) : ""}" placeholder="0"><b>₺</b></span></label></div></div></fieldset>
    ${seg("Ağır hasar kaydı", "heavyAns", opts([["0", "Yok"], ["1", "Var"]], car.heavyAns))}
    ${nav("kaporta", false)}`,
  iletisim: () => `${head("İletişim Bilgileri")}
    <div class="form">
      <label class="field"><span class="field__l">Ad soyad</span><input class="field__input" name="ad" autocomplete="name" value="${esc(car.name || "")}" data-focus></label>
      <label class="field"><span class="field__l">Cep telefonu</span><span class="tel"><b>+90</b><input class="field__input" name="tel" inputmode="tel" autocomplete="tel-national" placeholder="5xx xxx xx xx" value="${esc(car.tel || "")}"></span></label>
      <div class="field"><span class="field__l">Bulunduğunuz şehir</span><div class="pick pick--field" data-pick="sehir" data-label="Bulunduğunuz şehir" data-empty="Şehir seçin"></div></div>
      <label class="check"><input type="checkbox" name="kvkk" ${car.kvkk ? "checked" : ""}><span><a href="#">Aydınlatma metnini</a> okudum; bilgilerimin ön teklif ve randevu için kullanılmasını kabul ediyorum.</span></label>
    </div>
    ${nav("kayit", false, "Teklif Al")}`,
  /* the application (client, 23.11): no price, the expert calls; the narrow card opens up as the whole form */
  basvuru: () => {
    const all = [...rows(), ["Ad soyad", car.name], ["Cep telefonu", car.tel && "+90 " + car.tel], ["Bulunduğunuz şehir", car.city]].filter(([, v]) => v);
    return `<div class="done"><svg class="done__mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path d="M20 33l8 8 16-17"/></svg>
      <h2 class="scr__q" tabindex="-1">Başvurunuz Alındı</h2>
      <p class="done__text">Aracınıza en doğru ve avantajlı teklifi sunabilmek için bilgilerinizi güncel piyasa koşulları doğrultusunda titizlikle değerlendiriyoruz. MZA Araç Alım Uzmanımız, 1 saat içerisinde sizinle iletişime geçerek teklifimizi iletecektir.</p></div>
    <section class="formcard" aria-label="Teklif formu"><p class="label">Teklif Formu</p><p class="formcard__line">${esc(line())}</p><dl class="formcard__rows">${dl(all)}</dl></section>
    <div class="scr__nav"><button class="btn btn--gold btn--back" type="button" data-edit>${BACK}Bilgileri Düzenle</button><a class="btn btn--gold" href="../">Anasayfa ${ARW}</a></div>`;
  },
};

/* ---- what each screen does ---- */
/* one choice: it is kept, İleri wakes, and the screen moves on by itself */
const single = (key, next, after) => (s) => {
  const btn = s.querySelector("[data-next]");
  s.addEventListener("click", (e) => {
    const o = e.target.closest(".opt"); if (!o) return;
    s.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === o)));
    const prev = car[key];
    car[key] = key === "year" ? +o.dataset.v : o.dataset.v;
    if (after) after(prev);
    btn.disabled = false; summary(); save();
    setTimeout(() => go(next), reduced ? 0 : 260);
  });
  btn.addEventListener("click", () => go(next));
};
/* several groups on one screen: each keeps its answer; İleri wakes when all are given */
const groups = (keys, next) => (s) => {
  const btn = s.querySelector("[data-next]");
  const ok = () => { btn.disabled = !keys.every((k) => car[k]); };
  s.addEventListener("click", (e) => {
    const o = e.target.closest(".opt"); if (!o) return;
    const grp = o.closest("[data-k]");
    grp.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === o)));
    car[grp.dataset.k] = o.dataset.v; ok(); summary(); save();
  });
  btn.addEventListener("click", () => go(next));
  ok();
};
const WIRE = {
  marka: (s) => {
    const find = s.querySelector(".find");
    find.addEventListener("input", () => { const q = find.value.trim().toLocaleLowerCase("tr"); s.querySelectorAll(".opt").forEach((o) => { o.hidden = q && !o.textContent.toLocaleLowerCase("tr").includes(q); }); });
    single("brand", "model", (prev) => { if (prev !== car.brand) car.model = null; })(s);   /* another brand: its model is asked again */
  },
  model: single("model", "yil"),
  yil: single("year", "arac"),
  arac: groups(["body", "trim", "color"], "motor"),
  motor: groups(["engine", "fuel", "gear"], "km"),
  km: (s) => {
    const inp = s.querySelector(".km__in"), range = s.querySelector(".km__range"), next = s.querySelector("[data-next]");
    const set = (n, from) => {
      n = Math.max(0, Math.min(1999999, n || 0));
      car.km = n; next.disabled = !(n > 0);
      if (from !== "in") inp.value = n ? fmt(n) : "";
      if (from !== "range") range.value = Math.min(400000, n);
      range.style.setProperty("--p", Math.min(1, n / 400000));
      summary(); save();
    };
    inp.addEventListener("input", () => { const n = +inp.value.replace(/\D/g, ""); inp.value = n ? fmt(n) : ""; set(n, "in"); });
    range.addEventListener("input", () => set(+range.value, "range"));
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !next.disabled) go("kaporta"); });
    next.addEventListener("click", () => go("kaporta"));
    set(car.km || 0, "init");
  },
  kaporta: (s) => {
    const list = s.querySelector("[data-marked]"), reset = s.querySelector("[data-reset]");
    const names = Object.fromEntries(PARTS);
    const show = (parts) => {
      const ids = Object.keys(parts);
      list.innerHTML = ids.map((id) => `<li><i class="sw sw--${parts[id]}"></i>${names[id]}<span>${{ lokal: "Lokal boyalı", boyali: "Boyalı", degisen: "Değişen" }[parts[id]]}</span></li>`).join("");
      reset.hidden = !ids.length;
    };
    const c = mountCar(s.querySelector("[data-car]"), { parts: car.parts || {}, onChange: (p) => { car.parts = p; show(p); summary(); save(); } });
    reset.addEventListener("click", () => { car.parts = {}; c.set({}); show({}); summary(); save(); });
    s.querySelector("[data-next]").addEventListener("click", () => { car.partsDone = true; go("kayit"); });
    show(car.parts || {});
  },
  kayit: (s) => {
    const next = s.querySelector("[data-next]"), box = s.querySelector("[data-tramer]"), amt = s.querySelector("[data-tramer-in]");
    const ok = () => { next.disabled = !(car.hasTramer != null && car.heavyAns != null && (car.hasTramer === "0" || car.tramer > 0)); };
    /* the amount opens smoothly under its question, with its own room (client, 23.11: "burada kayma oluyor") */
    const openAmount = (on) => {
      box.classList.toggle("is-open", on); box.inert = !on;
      if (on) setTimeout(() => amt.focus({ preventScroll: true }), reduced ? 0 : 320);
    };
    s.addEventListener("click", (e) => {
      const o = e.target.closest(".opt"); if (!o) return;
      const grp = o.closest("[data-k]");
      grp.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === o)));
      car[grp.dataset.k] = o.dataset.v;
      if (grp.dataset.k === "hasTramer") { if (o.dataset.v === "0") car.tramer = 0; openAmount(o.dataset.v === "1"); }
      if (grp.dataset.k === "heavyAns") car.heavy = o.dataset.v === "1";
      ok(); summary(); save();
    });
    amt.addEventListener("input", () => { const n = +amt.value.replace(/\D/g, ""); amt.value = n ? fmt(n) : ""; car.tramer = n; ok(); summary(); save(); });
    next.addEventListener("click", () => { car.recordDone = true; go("iletisim"); });
    ok();
  },
  iletisim: (s) => {
    const next = s.querySelector("[data-next]"), name = s.querySelector('[name="ad"]'), tel = s.querySelector('[name="tel"]'), kvkk = s.querySelector('[name="kvkk"]');
    const city = makePick(s.querySelector('[data-pick="sehir"]'), { search: true, items: () => CITIES.map((c) => ({ value: c, label: c })), onPick: (o) => { car.city = o.value; ok(); save(); } });
    if (car.city) city.set(car.city);
    const telOk = (v) => /^5\d{9}$/.test(v.replace(/\D/g, ""));
    const ok = () => { next.disabled = !(name.value.trim().length >= 3 && telOk(tel.value) && car.city && kvkk.checked); };
    name.addEventListener("input", () => { car.name = name.value; ok(); save(); });
    tel.addEventListener("input", () => {
      const d = tel.value.replace(/\D/g, "").replace(/^0/, "").slice(0, 10);
      tel.value = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean).join(" ");
      car.tel = tel.value; ok(); save();
    });
    kvkk.addEventListener("change", () => { car.kvkk = kvkk.checked; ok(); save(); });
    next.addEventListener("click", async () => {
      next.disabled = true; next.classList.add("is-busy");
      const r = await apply({ car });
      car.ref = r.ref; car.sent = true; save(); go("basvuru");
    });
    ok();
  },
  basvuru: (s) => s.querySelector("[data-edit]").addEventListener("click", () => { car.sent = false; save(); go("marka", -1); }),
};

/* ---- the summary folds on a phone ---- */
const toggle = root.querySelector("[data-sum-toggle]"), sum = root.querySelector("[data-sum]");
toggle.addEventListener("click", () => { const o = toggle.getAttribute("aria-expanded") !== "true"; toggle.setAttribute("aria-expanded", String(o)); sum.classList.toggle("is-open", o); });

/* ---- start: from the home page's quick start (?marka=&model=&yil=), or where the visitor left off ---- */
const firstGap = () => !car.brand ? "marka" : !car.model ? "model" : !car.year ? "yil" : !(car.body && car.trim && car.color) ? "arac"
  : !(car.engine && car.fuel && car.gear) ? "motor" : !(car.km > 0) ? "km" : !car.partsDone ? "kaporta" : !car.recordDone ? "kayit" : "iletisim";
const q = new URLSearchParams(location.search);
if (q.get("yil") || q.get("marka")) {
  car = {};
  if (brand(q.get("marka"))) car.brand = q.get("marka");
  if (car.brand && model(car.brand, q.get("model"))) car.model = q.get("model");
  if (YEARS.includes(+q.get("yil"))) car.year = +q.get("yil");
  history.replaceState(null, "", location.pathname);
  go(firstGap());
} else {
  go(car.sent ? "basvuru" : firstGap());
}
