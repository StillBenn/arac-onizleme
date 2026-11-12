/* ==========================================================================
   Aurea — every page: the header, the menu, words arriving, our own pickers,
   and the home page's quick start and car diagram.
   ========================================================================== */
import { YEARS, BRANDS, brand } from "./data.js";
import { mountCar } from "./car.js";
import { makePick } from "./pick.js";

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

/* ---- the phone menu ---- */
const burger = document.querySelector("[data-burger]"), sheet = document.querySelector("[data-sheet]");
if (burger && sheet) {
  const set = (open) => {
    burger.setAttribute("aria-expanded", String(open));
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

/* ---- the home page: quick start and the diagram ---- */
const quick = document.querySelector("[data-quick]");
if (quick) {
  const el = (n) => quick.querySelector(`[data-pick="${n}"]`);
  const model = makePick(el("model"), { items: () => (brand(marka.value())?.models || []).map((m) => ({ value: m.id, label: m.name })) });
  model.disable(true);
  const marka = makePick(el("marka"), { search: true, items: () => BRANDS.map((b) => ({ value: b.id, label: b.name })), onPick: () => { model.disable(false); model.clear("Model seçin"); } });
  makePick(el("yil"), { grid: true, items: () => YEARS.map((y) => ({ value: String(y), label: String(y) })) });
  quick.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    for (const n of ["yil", "marka", "model"]) { const v = quick.querySelector(`input[name="${n}"]`).value; if (v) q.set(n, v); }
    location.href = quick.getAttribute("action") + (q.toString() ? "?" + q : "");
  });
}
const carEl = document.querySelector("[data-car]");
if (carEl) mountCar(carEl);
