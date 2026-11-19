/* ==========================================================================
   Aracımı sat — the valuation, one question at a time
   --------------------------------------------------------------------------
   Four steps: the car (year, brand, model, fuel and gearbox, package,
   kilometres), its condition (the diagram, damage record, heavy damage), the
   owner (name, phone, city, consent), and the offer (worked out, then an
   inspection slot). Each answer moves on by itself; "Geri" and the step
   names go back. The answers live in the summary card and survive a reload
   (sessionStorage). Prices and slots come from js/data.js — samples until
   the backend is connected.
   ========================================================================== */
import { YEARS, BRANDS, brand, model, FUELS, GEARS, BODIES, TRIMS, CITIES, PARTS, valuate, slots, book } from "./data.js";
import { mountCar } from "./car.js";
import { makePick } from "./pick.js";

const root = document.querySelector("[data-wiz]");
const screen = root.querySelector("[data-screen]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const KEY = "mza-degerleme";
const fmt = (n) => new Intl.NumberFormat("tr-TR").format(n);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ARW = '<svg class="arw" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>';

/* the screens, in order; each belongs to a step */
const SCREENS = ["yil", "marka", "model", "ozellik", "paket", "km", "kaporta", "kayit", "iletisim", "hesap", "teklif", "randevu", "tamam"];
const STEP_OF = { yil: 0, marka: 0, model: 0, ozellik: 0, paket: 0, km: 0, kaporta: 1, kayit: 1, iletisim: 2, hesap: 3, teklif: 3, randevu: 3, tamam: 3 };

let car = load();
let at = "yil";

function load() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function save() { try { sessionStorage.setItem(KEY, JSON.stringify(car)); } catch (e) { /* private window */ } }

/* ---- the summary card ---- */
function summary() {
  const b = brand(car.brand), m = model(car.brand, car.model);
  const damaged = Object.keys(car.parts || {}).length;
  const rows = [
    ["Model yılı", car.year], ["Marka", b && b.name], ["Model", m && m.name],
    ["Yakıt · vites", car.fuel && car.gear && `${label(FUELS, car.fuel)} · ${label(GEARS, car.gear)}`],
    ["Kasa", car.body && label(BODIES, car.body)], ["Paket", car.trim],
    ["Kilometre", car.km != null && car.km !== "" && fmt(car.km) + " km"],
    ["Kaporta", car.partsDone && (damaged ? `${damaged} parça işaretli` : "Hasarsız")],
    ["Tramer", car.recordDone && (car.tramer > 0 ? fmt(car.tramer) + " ₺" : "Yok")],
    ["Ağır hasar", car.recordDone && (car.heavy ? "Var" : "Yok")],
  ].filter(([, v]) => v);
  root.querySelector("[data-sum-rows]").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
  root.querySelector("[data-sum-line]").textContent = [car.year, b && b.name, m && m.name].filter(Boolean).join(" · ") || "Henüz seçim yok";
}
const label = (list, id) => (list.find(([k]) => k === id) || [, id])[1];

/* ---- steps bar ---- */
function steps() {
  const s = STEP_OF[at];
  root.querySelectorAll("[data-step]").forEach((li) => {
    const k = +li.dataset.step;
    li.classList.toggle("is-on", k === s); li.classList.toggle("is-done", k < s);
    li.querySelector("button").disabled = !(k < s) || at === "tamam" || at === "hesap";
  });
  const i = SCREENS.indexOf(at);
  root.querySelector("[data-track]").style.transform = `scaleX(${Math.min(1, (i + 1) / (SCREENS.length - 1))})`;
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
  car.at = next === "hesap" ? "iletisim" : next;
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
const back = (to) => `<button class="back" type="button" data-back="${to}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5M9 5.5 4.5 10 9 14.5"/></svg>Geri</button>`;
screen.addEventListener("click", (e) => { const b = e.target.closest("[data-back]"); if (b) go(b.dataset.back, -1); });
const head = (q, hint) => `<h2 class="scr__q" tabindex="-1">${q}</h2>${hint ? `<p class="scr__hint">${hint}</p>` : ""}`;
const opts = (list, cur, cls = "") => list.map(([v, l]) => `<button type="button" class="opt ${cls}" data-v="${esc(v)}" aria-pressed="${String(v) === String(cur)}">${esc(l)}</button>`).join("");

/* ---- the screens ---- */
const RENDER = {
  yil: () => `${head("Aracınız hangi yıl model?")}<div class="opts opts--years">${opts(YEARS.map((y) => [y, y]), car.year, "opt--mono")}</div>`,
  marka: () => `${back("yil")}${head("Markası nedir?")}<input class="field__input find" type="search" placeholder="Marka ara" aria-label="Marka ara" data-focus autocomplete="off"><div class="opts opts--brands" data-list>${opts(BRANDS.map((b) => [b.id, b.name]), car.brand, "opt--brand")}</div>`,
  model: () => `${back("marka")}${head(`${esc(brand(car.brand)?.name || "")} — hangi model?`)}<div class="opts opts--models">${opts((brand(car.brand)?.models || []).map((m) => [m.id, m.name]), car.model, "opt--brand")}</div>`,
  ozellik: () => `${back("model")}${head("Yakıt, vites ve kasa", "Ruhsatta yazan bilgilerle aynı olmalı.")}
    <fieldset class="seg"><legend>Yakıt</legend><div class="opts opts--row" data-k="fuel">${opts(FUELS, car.fuel)}</div></fieldset>
    <fieldset class="seg"><legend>Vites</legend><div class="opts opts--row" data-k="gear">${opts(GEARS, car.gear)}</div></fieldset>
    <fieldset class="seg"><legend>Kasa tipi</legend><div class="opts opts--row" data-k="body">${opts(BODIES, car.body)}</div></fieldset>
    <div class="scr__go"><button class="btn btn--gold" type="button" data-next disabled>Devam ${ARW}</button></div>`,
  paket: () => `${back("ozellik")}${head("Donanım paketi", "Emin değilseniz “Bilmiyorum” deyin; ekspertizde birlikte bakarız.")}<div class="opts opts--list">${opts(TRIMS.map((t) => [t, t]), car.trim, "opt--brand")}</div>`,
  km: () => `${back("paket")}${head("Kilometresi kaç?")}
    <label class="km"><input class="km__in" inputmode="numeric" autocomplete="off" aria-label="Kilometre" data-focus value="${car.km != null ? fmt(car.km) : ""}" placeholder="0"><span class="km__u">km</span></label>
    <input class="km__range" type="range" min="0" max="400000" step="1000" value="${car.km || 0}" aria-label="Kilometre kaydırıcı">
    <div class="km__scale" aria-hidden="true"><span>0</span><span>100 bin</span><span>200 bin</span><span>300 bin</span><span>400 bin+</span></div>
    <div class="scr__go"><button class="btn btn--gold" type="button" data-next ${car.km > 0 ? "" : "disabled"}>Devam ${ARW}</button></div>`,
  kaporta: () => `${back("km")}${head("Boyalı ya da değişen parça var mı?", "Parçaya dokunun, durumunu seçin. Hasarsızsa doğrudan devam edin.")}
    <div class="kap"><div class="car" data-car></div><div class="kap__side"><ul class="legend" role="list"><li><i class="sw sw--orijinal"></i>Orijinal</li><li><i class="sw sw--lokal"></i>Lokal boyalı</li><li><i class="sw sw--boyali"></i>Boyalı</li><li><i class="sw sw--degisen"></i>Değişen</li></ul>
    <ul class="kap__list" data-marked role="list"></ul><button class="link" type="button" data-reset hidden>Hepsini orijinal yap</button></div></div>
    <div class="scr__go"><button class="btn btn--gold" type="button" data-next>Devam ${ARW}</button></div>`,
  kayit: () => `${back("kaporta")}${head("Hasar kayıtları")}
    <fieldset class="seg"><legend>Tramer kaydı</legend><div class="opts opts--row" data-k="hasTramer">${opts([["0", "Yok"], ["1", "Var"]], car.hasTramer)}</div>
      <label class="field" data-tramer ${car.hasTramer === "1" ? "" : "hidden"}><span class="field__l">Toplam tramer tutarı</span><span class="money"><input class="field__input" inputmode="numeric" data-tramer-in value="${car.tramer ? fmt(car.tramer) : ""}" placeholder="0"><b>₺</b></span></label></fieldset>
    <fieldset class="seg"><legend>Ağır hasar kaydı</legend><div class="opts opts--row" data-k="heavyAns">${opts([["0", "Yok"], ["1", "Var"]], car.heavyAns)}</div></fieldset>
    <div class="scr__go"><button class="btn btn--gold" type="button" data-next disabled>Devam ${ARW}</button></div>`,
  iletisim: () => `${back("kayit")}${head("Ön teklifiniz kime gelsin?", "Teklifi ekranda hemen göreceksiniz; telefonunuz yalnızca randevu için.")}
    <div class="form">
      <label class="field"><span class="field__l">Ad soyad</span><input class="field__input" name="ad" autocomplete="name" value="${esc(car.name || "")}" data-focus></label>
      <label class="field"><span class="field__l">Cep telefonu</span><span class="tel"><b>+90</b><input class="field__input" name="tel" inputmode="tel" autocomplete="tel-national" placeholder="5xx xxx xx xx" value="${esc(car.tel || "")}"></span></label>
      <div class="field"><span class="field__l">Şehir</span><div class="pick pick--field" data-pick="sehir" data-label="Şehir" data-empty="Şehir seçin"></div></div>
      <label class="check"><input type="checkbox" name="kvkk" ${car.kvkk ? "checked" : ""}><span><a href="#">Aydınlatma metnini</a> okudum; bilgilerimin ön teklif ve randevu için kullanılmasını kabul ediyorum.</span></label>
    </div>
    <div class="scr__go"><button class="btn btn--gold" type="button" data-next disabled>Ön teklifimi göster ${ARW}</button></div>`,
  hesap: () => `<div class="calc"><svg class="gauge" viewBox="0 0 200 120" aria-hidden="true"><path class="gauge__track" d="M20 110a80 80 0 0 1 160 0"/><path class="gauge__arc" d="M20 110a80 80 0 0 1 160 0" pathLength="1"/></svg>
    <h2 class="scr__q" tabindex="-1">Ön teklifiniz hesaplanıyor</h2><p class="scr__hint">Model, kilometre ve hasar bilgileriniz güncel piyasa verisiyle karşılaştırılıyor.</p></div>`,
  teklif: () => {
    const o = car.offer || { low: 0, high: 0 };
    const b = brand(car.brand), m = model(car.brand, car.model);
    return `<p class="label">Ön teklifiniz</p><h2 class="scr__q" tabindex="-1">${esc([car.year, b && b.name, m && m.name].filter(Boolean).join(" "))}</h2>
    <p class="offer"><span data-count="${o.low}">0</span><i>–</i><span data-count="${o.high}">0</span><b>₺</b></p>
    <ul class="offer__why" role="list"><li><span>Kilometre</span>${fmt(car.km || 0)} km</li><li><span>Kaporta</span>${Object.keys(car.parts || {}).length ? Object.keys(car.parts).length + " parça işaretli" : "Hasarsız"}</li><li><span>Tramer</span>${car.tramer > 0 ? fmt(car.tramer) + " ₺" : "Yok"}</li></ul>
    <p class="scr__hint">Kesin teklifimizi ücretsiz ekspertizden sonra veririz. Teklifi kabul etmezseniz hiçbir yükümlülüğünüz olmaz.</p>
    ${"preview" in document.body.dataset ? `<p class="scr__note">Önizleme: bu fiyat örnek bir modelle hesaplandı.</p>` : ""}
    <div class="scr__go scr__go--two"><button class="btn btn--gold" type="button" data-next>Ücretsiz ekspertiz randevusu al ${ARW}</button><button class="link" type="button" data-back="kaporta">Bilgileri düzenle</button></div>`;
  },
  randevu: () => `${back("teklif")}${head("Ekspertiz için gün ve saat", `${esc(car.city || "")} · size en yakın ekspertiz noktasında, yaklaşık 45 dakika`)}
    <div class="days" data-days role="list"></div><div class="times" data-times></div>
    <div class="scr__go"><button class="btn btn--gold" type="button" data-next disabled>Randevuyu onayla ${ARW}</button></div>`,
  tamam: () => {
    const d = car.slot ? new Date(car.slot.date) : null;
    const when = d ? d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" }) + ", " + car.slot.t : "";
    return `<div class="done"><svg class="done__mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path d="M20 33l8 8 16-17"/></svg>
    <p class="label">Randevunuz alındı</p><h2 class="scr__q" tabindex="-1">${esc(when)}</h2>
    <p class="scr__hint">Randevu numaranız <b class="mono">${esc(car.ref || "")}</b>. Adres ve hatırlatma ${esc(car.tel ? "+90 " + car.tel : "telefonunuza")} numarasına SMS ile gönderilecek. Ruhsat, kimlik ve varsa yedek anahtarı yanınıza alın.</p>
    <div class="scr__go scr__go--two"><a class="btn btn--gold" href="../">Ana sayfaya dön ${ARW}</a><button class="link" type="button" data-again>Başka bir araç değerle</button></div></div>`;
  },
};

/* ---- what each screen does ---- */
const pickAndGo = (scr, key, next, after) => scr.addEventListener("click", (e) => {
  const o = e.target.closest(".opt"); if (!o) return;
  scr.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === o)));
  car[key] = key === "year" ? +o.dataset.v : o.dataset.v;
  if (after) after();
  summary(); save();
  setTimeout(() => go(next), reduced ? 0 : 260);
});
const WIRE = {
  yil: (s) => pickAndGo(s, "year", "marka"),
  marka: (s) => {
    const find = s.querySelector(".find");
    find.addEventListener("input", () => { const q = find.value.trim().toLocaleLowerCase("tr"); s.querySelectorAll(".opt").forEach((o) => { o.hidden = q && !o.textContent.toLocaleLowerCase("tr").includes(q); }); });
    pickAndGo(s, "brand", "model", () => { car.model = null; });
  },
  model: (s) => pickAndGo(s, "model", "ozellik"),
  ozellik: (s) => {
    const next = s.querySelector("[data-next]");
    const ok = () => { next.disabled = !(car.fuel && car.gear && car.body); };
    s.addEventListener("click", (e) => {
      const o = e.target.closest(".opt"); if (!o) return;
      const grp = o.closest("[data-k]");
      grp.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === o)));
      car[grp.dataset.k] = o.dataset.v; ok(); summary(); save();
    });
    next.addEventListener("click", () => go("paket"));
    ok();
  },
  paket: (s) => pickAndGo(s, "trim", "km"),
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
    s.addEventListener("click", (e) => {
      const o = e.target.closest(".opt"); if (!o) return;
      const grp = o.closest("[data-k]");
      grp.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === o)));
      car[grp.dataset.k] = o.dataset.v;
      if (grp.dataset.k === "hasTramer") { box.hidden = o.dataset.v !== "1"; if (o.dataset.v === "0") car.tramer = 0; else amt.focus(); }
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
    next.addEventListener("click", () => go("hesap"));
    ok();
  },
  hesap: async () => {
    const t0 = performance.now();
    const offer = await valuate(car);
    car.offer = offer; save();
    setTimeout(() => go("teklif"), Math.max(0, 1800 - (performance.now() - t0)));
  },
  teklif: (s) => {
    s.querySelectorAll("[data-count]").forEach((el) => countUp(el, +el.dataset.count));
    s.querySelector("[data-next]").addEventListener("click", () => go("randevu"));
  },
  randevu: async (s) => {
    const days = await slots(car.city);
    const dEl = s.querySelector("[data-days]"), tEl = s.querySelector("[data-times]"), next = s.querySelector("[data-next]");
    let day = 0;
    const drawTimes = () => {
      tEl.innerHTML = days[day].times.map((x) => `<button type="button" class="opt opt--mono" data-t="${x.t}" ${x.taken ? "disabled" : ""} aria-pressed="${car.slot && car.slot.t === x.t && new Date(car.slot.date).toDateString() === days[day].date.toDateString()}">${x.t}</button>`).join("");
    };
    dEl.innerHTML = days.map((d, i) => `<button type="button" class="day" data-i="${i}" aria-pressed="${i === 0}"><span>${d.date.toLocaleDateString("tr-TR", { weekday: "short" })}</span><b>${d.date.getDate()}</b><span>${d.date.toLocaleDateString("tr-TR", { month: "short" })}</span></button>`).join("");
    drawTimes();
    dEl.addEventListener("click", (e) => { const b = e.target.closest(".day"); if (!b) return; day = +b.dataset.i; dEl.querySelectorAll(".day").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawTimes(); });
    tEl.addEventListener("click", (e) => {
      const b = e.target.closest(".opt"); if (!b || b.disabled) return;
      tEl.querySelectorAll(".opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      car.slot = { date: days[day].date.toISOString(), t: b.dataset.t }; next.disabled = false; save();
    });
    next.addEventListener("click", async () => {
      next.disabled = true; next.classList.add("is-busy");
      const r = await book({ car, slot: car.slot });
      car.ref = r.ref; save(); go("tamam");
    });
  },
  tamam: (s) => s.querySelector("[data-again]").addEventListener("click", () => { car = {}; save(); go("yil", -1); }),
};

function countUp(el, to) {
  if (reduced) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 1500;
  const tick = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(Math.round(to * e / 1000) * 1000); if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(to); };
  requestAnimationFrame(tick);
}

/* ---- the summary folds on a phone ---- */
const toggle = root.querySelector("[data-sum-toggle]"), sum = root.querySelector("[data-sum]");
toggle.addEventListener("click", () => { const o = toggle.getAttribute("aria-expanded") !== "true"; toggle.setAttribute("aria-expanded", String(o)); sum.classList.toggle("is-open", o); });

/* ---- start: from the home page's quick start (?yil=&marka=&model=), or where the visitor left off ---- */
const q = new URLSearchParams(location.search);
if (q.get("yil") || q.get("marka")) {
  car = {};
  if (YEARS.includes(+q.get("yil"))) car.year = +q.get("yil");
  if (brand(q.get("marka"))) car.brand = q.get("marka");
  if (car.brand && model(car.brand, q.get("model"))) car.model = q.get("model");
  history.replaceState(null, "", location.pathname);
  go(!car.year ? "yil" : !car.brand ? "marka" : !car.model ? "model" : "ozellik");
} else {
  const resume = ["tamam", "teklif", "randevu"].includes(car.at) && car.offer ? car.at : null;
  go(resume || (!car.year ? "yil" : !car.brand ? "marka" : !car.model ? "model" : !car.fuel || !car.gear || !car.body ? "ozellik" : !car.trim ? "paket" : !(car.km > 0) ? "km" : !car.partsDone ? "kaporta" : !car.recordDone ? "kayit" : "iletisim"));
}
