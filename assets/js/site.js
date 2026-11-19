/* ==========================================================================
   MZA Cars — every page: the header, the menu, words arriving, our own pickers,
   and the home page's quick start.
   ========================================================================== */
import { YEARS, BRANDS, brand } from "./data.js";
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

/* ---- the home page: quick start and the diagram ---- */
const quick = document.querySelector("[data-quick]");
if (quick) {
  const NEED = ["yil", "marka", "model"];           /* all three must be chosen before the offer (client, 19.11) */
  const el = (n) => quick.querySelector(`[data-pick="${n}"]`);
  const flag = (n, bad) => { const b = el(n).querySelector(".pick__btn"); if (bad) { b.setAttribute("aria-invalid", "true"); b.setAttribute("aria-describedby", "quick-msg"); } else { b.removeAttribute("aria-invalid"); b.removeAttribute("aria-describedby"); } };
  const ok = (n) => { el(n).classList.remove("is-invalid", "is-nudge", "is-first"); flag(n, false); };
  const model = makePick(el("model"), { items: () => (brand(marka.value())?.models || []).map((m) => ({ value: m.id, label: m.name })), onPick: () => ok("model") });
  model.disable(true);
  const marka = makePick(el("marka"), { search: true, items: () => BRANDS.map((b) => ({ value: b.id, label: b.name })), onPick: () => { ok("marka"); model.disable(false); model.clear(); } });
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
    const q = new URLSearchParams();
    NEED.forEach((n) => q.set(n, val(n)));
    location.href = quick.getAttribute("action") + "?" + q;
  });
}

/* ---- how it works: the frame tells the four steps ----
   Wide screens: once the frame is in view it tells the steps in order from the first, one every
   STEP_MS (the lit dash fills like a timer). The pointer on a step shows that step and holds it;
   leaving the list lets the story go on from there. Out of view or in a hidden tab it waits, and
   under reduced motion it does not play by itself at all — the pointer alone moves it.
   Phones have no frame (each step carries its own picture): there the gold rule marks the step
   being read, the one whose top has crossed a line a little below the middle of the screen. */
const stepsEl = document.querySelector("[data-how]");
if (stepsEl) {
  const STEP_MS = 4800;
  const view = stepsEl.querySelector(".steps__view");
  const items = [...stepsEl.querySelectorAll("[data-how-step]")];
  const shots = [...stepsEl.querySelectorAll("[data-how-shot]")];
  const dots = [...stepsEl.querySelectorAll(".steps__dots i")];
  let on = 0, timer = 0, inView = false, held = false, queued = false;
  const wide = () => getComputedStyle(view).display !== "none";
  const show = (i) => {
    on = i;
    items.forEach((el, k) => el.classList.toggle("is-on", k === i));
    shots.forEach((el, k) => el.classList.toggle("is-on", k === i));
    dots.forEach((el) => el.classList.remove("is-on"));
    void view.offsetWidth;                    /* the dash starts filling again from empty */
    dots[i].classList.add("is-on");
  };
  const tick = () => {
    clearTimeout(timer);
    const play = wide() && !reduced && inView && !held && !document.hidden;
    view.classList.toggle("is-playing", play);
    if (play) timer = setTimeout(() => { show((on + 1) % items.length); tick(); }, STEP_MS);
  };
  new IntersectionObserver(([e]) => {
    const now = e.intersectionRatio >= 0.55;
    if (now && !inView && !held) show(0);     /* every time it comes into view, from the first step */
    inView = now;
    tick();
  }, { threshold: [0, 0.55] }).observe(view);
  document.addEventListener("visibilitychange", tick);
  if (matchMedia("(hover: hover)").matches) {
    items.forEach((el, k) => el.addEventListener("pointerenter", () => { if (!wide()) return; held = true; if (k !== on) show(k); tick(); }));
    stepsEl.querySelector(".steps__list").addEventListener("pointerleave", () => { if (!held) return; held = false; tick(); });
  }
  items.forEach((el, k) => el.addEventListener("click", () => { if (wide() && k !== on) { show(k); tick(); } }));
  const reading = () => {
    queued = false;
    if (wide()) return;
    const line = innerHeight * 0.58;
    let read = 0;
    items.forEach((el, k) => { if (el.getBoundingClientRect().top < line) read = k; });
    if (read !== on) show(read);
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(reading); } }, { passive: true });
  addEventListener("resize", () => { reading(); tick(); });
  reading();
}
