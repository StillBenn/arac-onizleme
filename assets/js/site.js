/* ==========================================================================
   MZA Cars — every page: the header, the menu, words arriving, our own pickers,
   and the home page's quick start.
   ========================================================================== */
import { YEARS, BRANDS } from "./data.js";
import { makePick } from "./pick.js";
import "./scroll.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- the header: glass once the page moves; ink on the ivory sections ---- */
const hdr = document.querySelector("[data-hdr]");
const papers = [...document.querySelectorAll(".sec--paper")];
function headerTone() {
  if (!hdr) return;
  const line = hdr.offsetHeight;
  const onPaper = papers.some((s) => { const r = s.getBoundingClientRect(); return r.top <= line && r.bottom > line; });
  hdr.classList.toggle("is-stuck", scrollY > 8 && !onPaper);
  hdr.classList.toggle("is-paper", onPaper);
}
addEventListener("scroll", headerTone, { passive: true });
addEventListener("resize", headerTone);
headerTone();

/* ---- the home page's menu follows the section on screen (critique, 20.11): the gold mark sits under the
   link of the section whose top has passed a line a third of the way down; the footer lights "İletişim" ---- */
if (document.body.dataset.page === "index") {
  const links = [...document.querySelectorAll(".nav .nav__link, .sheet__nav .nav__link")].filter((a) => a.pathname === location.pathname);
  const spots = links.map((a) => a.hash).filter((h, i, all) => all.indexOf(h) === i)
    .map((h) => [h, h ? document.getElementById(h.slice(1)) : document.getElementById("arac-satim")]).filter(([, el]) => el);
  document.documentElement.classList.add("has-spy");
  let queued = false;
  const spy = () => {
    queued = false;
    const line = (hdr ? hdr.offsetHeight : 0) + innerHeight * 0.3;
    let here = "";
    spots.forEach(([h, el]) => { if (el.getBoundingClientRect().top <= line) here = h; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) here = "#iletisim";
    links.forEach((a) => a.classList.toggle("is-here", a.hash === here));
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(spy); } }, { passive: true });
  addEventListener("resize", spy);
  spy();
}

/* ---- the sale's steps: a pointer brings each picture up (CSS :hover); a phone has no pointer, so the
   step being read, the one crossing the middle of the screen, lights up instead ---- */
if (matchMedia("(hover: none)").matches && "IntersectionObserver" in window) {
  const lit = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-lit", e.isIntersecting)), { rootMargin: "-35% 0px -35% 0px" });
  document.querySelectorAll(".steps__row .step").forEach((el) => lit.observe(el));
}

/* ---- about us: the car in the photo stands in the middle of the gap between the words and the two panes
   (client, 23.11), whatever the width. The gap is measured; the photo is drawn only as much wider than the
   band as the slide needs (each extra pixel is zoom), and slid so the car's centre lands on the gap's ---- */
const band = document.querySelector(".band");
if (band) {
  const right = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().right; };
  const CAR = 0.487, AR = 2400 / 1516;          /* the car's centre across the photo, and the photo's shape */
  const place = () => {
    if (innerWidth <= 900) { band.style.removeProperty("--photo-w"); band.style.removeProperty("--photo-l"); return; }
    const box = band.getBoundingClientRect(), W = box.width, H = box.height;
    const words = Math.max(right(band.querySelector(".band__title")), right(band.querySelector(".band__sub")));
    const target = (words + band.querySelector(".band__cards").getBoundingClientRect().left) / 2 - box.left;
    for (let w = W; w <= W * 1.6; w += W * 0.01) {      /* the narrowest frame that still covers the band */
      const img = Math.max(w, H * AR);                  /* object-fit: cover inside that frame */
      const l = target - (w / 2 + (CAR - 0.5) * img);
      if (l <= 0 && l + w >= W) { band.style.setProperty("--photo-w", Math.ceil(w) + "px"); band.style.setProperty("--photo-l", Math.round(l) + "px"); return; }
    }
  };
  place();
  addEventListener("resize", place);
  if (document.fonts) document.fonts.ready.then(place);
}

/* ---- the phone menu ---- */
const burger = document.querySelector("[data-burger]"), sheet = document.querySelector("[data-sheet]");
if (burger && sheet) {
  const set = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("has-sheet", open);
    if (open) { sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add("is-open")); document.documentElement.style.overflow = "hidden"; }
    else { sheet.classList.remove("is-open"); document.documentElement.style.overflow = ""; setTimeout(() => { if (burger.getAttribute("aria-expanded") === "false") sheet.hidden = true; }, 400); }
  };
  burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
  sheet.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { set(false); burger.focus(); } });
}

/* ---- words arrive once as they come on screen ---- */
const reveals = document.querySelectorAll(".reveal");
if (reduced || !("IntersectionObserver" in window)) reveals.forEach((el) => el.classList.add("is-in"));
else {
  reveals.forEach((el) => { const sib = [...el.parentElement.children].filter((c) => c.classList.contains("reveal")); el.style.setProperty("--d", Math.min(5, sib.indexOf(el))); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
}

/* ---- the home page: quick start ----
   The client's order (23.11): brand, then model, then year. A chosen brand narrows the models to its
   own; before it, the model list still holds every brand's models (the brand shown beside each, and
   searchable), and choosing one fills in its brand. A model that does not belong to a newly chosen
   brand is cleared. A model's value is "brand/model". */
const quick = document.querySelector("[data-quick]");
if (quick) {
  const NEED = ["marka", "model", "yil"];           /* all three must be chosen before the offer (client, 19.11) */
  const el = (n) => quick.querySelector(`[data-pick="${n}"]`);
  const flag = (n, bad) => { const b = el(n).querySelector(".pick__btn"); if (bad) { b.setAttribute("aria-invalid", "true"); b.setAttribute("aria-describedby", "quick-msg"); } else { b.removeAttribute("aria-invalid"); b.removeAttribute("aria-describedby"); } };
  const ok = (n) => { el(n).classList.remove("is-invalid", "is-nudge", "is-first"); flag(n, false); };
  const ALL = BRANDS.flatMap((b) => b.models.map((m) => ({ value: `${b.id}/${m.id}`, label: m.name, note: b.name, short: m.name })))
    .sort((a, b) => a.label.localeCompare(b.label, "tr") || a.note.localeCompare(b.note, "tr"));
  const model = makePick(el("model"), { search: true,
    items: () => { const b = marka.value(); return b ? ALL.filter((o) => o.value.startsWith(b + "/")).map((o) => ({ ...o, note: "" })) : ALL; },
    onPick: (o) => { ok("model"); const b = o.value.split("/")[0]; if (marka.value() !== b) { marka.set(b); ok("marka"); } } });
  const marka = makePick(el("marka"), { search: true, items: () => BRANDS.map((b) => ({ value: b.id, label: b.name })),
    onPick: (o) => { ok("marka"); if (model.value() && !model.value().startsWith(o.value + "/")) model.clear(); } });
  makePick(el("yil"), { grid: true, items: () => YEARS.map((y) => ({ value: String(y), label: String(y) })), onPick: () => ok("yil") });
  const msg = quick.querySelector("[data-quick-msg]");
  quick.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (n) => quick.querySelector(`input[name="${n}"]`).value;
    const miss = NEED.filter((n) => !val(n));
    if (miss.length) {                               /* the empty ones turn red and give a small shake */
      NEED.forEach((n) => { const p = el(n); p.classList.remove("is-nudge", "is-first"); p.classList.toggle("is-invalid", miss.includes(n)); flag(n, miss.includes(n)); });
      void quick.offsetWidth;
      el(miss[0]).classList.add("is-nudge", "is-first");   /* the eye goes to where to begin */
      el(miss[0]).querySelector(".pick__btn").focus({ preventScroll: true });
      if (msg) msg.textContent = "Teklif için önce " + miss.map((n) => el(n).dataset.label.toLocaleLowerCase("tr")).join(", ") + " seçin.";
      return;
    }
    const q = new URLSearchParams({ yil: val("yil"), marka: val("marka"), model: val("model").split("/")[1] });
    location.href = quick.getAttribute("action") + "?" + q;
  });
}
