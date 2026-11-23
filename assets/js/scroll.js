/* ==========================================================================
   MZA Cars — scrolling
   --------------------------------------------------------------------------
   A mouse wheel does not produce motion, it produces steps: one notch is a
   fixed jump. Here the real scroll position follows a target on a critically
   damped spring, so a notch becomes a short glide that gathers speed and
   settles without overshoot, and a run of notches one continuous movement.
   The position itself is eased (no fake transform): the header, the reveals
   and the steps viewer read window.scrollY as before.

   Deliberately limited:
   · Fine pointers only; touch scrolling is already inertial. Off under
     prefers-reduced-motion.
   · Never a zoom gesture, never a sideways wheel, never a box that scrolls
     itself (a picker's list, the open menu): the wheel is theirs.
   · Anything that moves the page without us (a scrollbar drag, find in
     page, a screen reader, the wizard's own scroll) is adopted, not fought.

   The scrollbar (site.css .sbar) replaces the system's on a mouse: a
   champagne filament over the night, gold ink over the ivory paper.
   ========================================================================== */
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches && matchMedia("(hover: hover)").matches;

const OMEGA = 8;        /* stiffness: ~0.6 s to settle a notch */
const SETTLE = 0.35;    /* px: below this (and slow) snap and stop */
let target = scrollY, current = target, written = Math.round(current), vel = 0;
let max = 0, running = false, last = 0;

function measure() {
  max = Math.max(0, root.scrollHeight - innerHeight);
  if (target > max) target = max;
}
const clamp = (v) => (v < 0 ? 0 : v > max ? max : v);

function frame(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  /* the spring solved exactly over dt: the same glide at 60, 144 and 240 Hz */
  const x0 = current - target, e = Math.exp(-OMEGA * dt), c = vel + OMEGA * x0;
  current = target + (x0 + c * dt) * e;
  vel = (vel - OMEGA * c * dt) * e;
  if (Math.abs(target - current) < SETTLE && Math.abs(vel) < 6) { current = target; vel = 0; running = false; }
  written = Math.round(current);
  scrollTo(0, current);
  if (running) requestAnimationFrame(frame);
}
function start() {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}
const glides = fine && !reduced;

/* move the page to y: glided where the spring runs, the browser's own way elsewhere */
export function scrollToY(y) {
  measure();
  y = clamp(y);
  if (!glides) { scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" }); return; }
  target = y;
  start();
}

/* a box under the pointer that can still scroll that way keeps the wheel */
function ownsWheel(el, dy) {
  if (el.closest && el.closest(".pick__pop, .sheet, .car__pop")) return true;
  for (; el && el.nodeType === 1 && el !== document.body && el !== root; el = el.parentElement) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
      if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    }
  }
  return false;
}
const locked = () => root.classList.contains("has-sheet") || root.style.overflow === "hidden";

if (glides) {
  root.style.scrollBehavior = "auto";     /* the CSS smooth scroll would race the spring */

  addEventListener("wheel", (e) => {
    if (e.ctrlKey || locked()) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (ownsWheel(e.target, e.deltaY)) return;
    e.preventDefault();
    /* deltaMode 1 is lines, 2 is pages: both to pixels */
    const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    measure();
    target = clamp(target + d);
    start();
  }, { passive: false });

  /* keys too, or the page would glide under the wheel and snap under the space bar */
  const KEYS = {
    PageDown: () => innerHeight * 0.9, PageUp: () => -innerHeight * 0.9,
    ArrowDown: () => 110, ArrowUp: () => -110,
    Home: () => -Infinity, End: () => Infinity,
    " ": (e) => innerHeight * (e.shiftKey ? -0.9 : 0.9),
  };
  addEventListener("keydown", (e) => {
    const t = e.target, tag = (t && t.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || locked()) return;
    if (t && t.closest && t.closest(".pick, .car, [role='listbox']")) return;   /* a picker's own arrow keys */
    const step = KEYS[e.key];
    if (!step) return;
    if (e.key === " " && t && t.closest && t.closest("button, [role='button'], a, summary, label")) return;   /* space presses it */
    e.preventDefault();
    measure();
    const d = step(e);
    target = d === Infinity ? max : d === -Infinity ? 0 : clamp(target + d);
    start();
  });

  /* someone else moved the page: adopt it (compared with what WE last wrote — scroll events arrive late) */
  addEventListener("scroll", () => {
    if (Math.abs(scrollY - written) > 2) { current = target = written = scrollY; vel = 0; }
  }, { passive: true });
  addEventListener("resize", measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);
  measure();
}

/* In-page links (the header's "#satis-sureci", "#sss"…, written with the page's own address): glide there.
   The landing puts the section's first line (its label) just under the header, not the section's
   edge: a section's own top padding would otherwise push what it shows below the fold
   ("Nasıl çalışır" lost the foot of its frame on a 942 px screen). */
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest && e.target.closest("a[href*='#']");
  if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
  const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
  if (!el) return;
  e.preventDefault();
  const hdr = document.querySelector("[data-hdr]");
  const room = (hdr ? hdr.offsetHeight : 0) + 24;
  const pad = el.matches("section") ? parseFloat(getComputedStyle(el).paddingTop) || 0 : 0;   /* a card (the footer's "MZA Ekspert") lands whole, its own edge under the header */
  const tf = getComputedStyle(el).transform;   /* a card still arriving (.reveal) sits lower than it will rest: aim for where it rests */
  const lift = tf && tf !== "none" ? new DOMMatrix(tf).m42 : 0;
  scrollToY(el.getBoundingClientRect().top - lift + scrollY + pad - room);
  if (history.replaceState) history.replaceState(null, "", a.hash);
  if (a.classList.contains("skip")) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
});

/* ---- the scrollbar ---- */
if (fine) {
  const bar = document.createElement("div");
  bar.className = "sbar";
  bar.setAttribute("aria-hidden", "true");
  const thumb = document.createElement("i");
  thumb.className = "sbar__thumb";
  bar.appendChild(thumb);
  document.body.appendChild(bar);
  root.classList.add("has-sbar");

  const INSET = 12, MIN = 48;
  let trackH = 0, thumbH = 0, room = 0, docMax = 0, thumbY = INSET, queued = false, sleep = 0, drag = null;

  const geom = () => {
    const vh = innerHeight, sh = root.scrollHeight;
    docMax = Math.max(0, sh - vh);
    trackH = vh - INSET * 2;
    thumbH = Math.max(MIN, Math.min(trackH, (trackH * vh) / Math.max(1, sh)));
    room = Math.max(1, trackH - thumbH);
    thumb.style.height = thumbH + "px";
    bar.hidden = docMax < 2;
  };
  const put = (y) => {
    thumbY = Math.min(INSET + room, Math.max(INSET, y));
    thumb.style.transform = `translate3d(0,${thumbY.toFixed(1)}px,0)`;
  };
  /* ivory under the thumb's middle? (the paper sections are the only light ground) */
  const papers = [...document.querySelectorAll(".sec--paper")];
  const tone = () => {
    const y = thumbY + thumbH / 2;
    bar.classList.toggle("is-paper", papers.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
  };
  const place = () => {
    queued = false;
    if (!drag) put(INSET + (docMax ? scrollY / docMax : 0) * room);
    tone();
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
  const wake = () => {
    bar.classList.add("is-awake");
    clearTimeout(sleep);
    sleep = setTimeout(() => { if (!drag) bar.classList.remove("is-awake"); }, 1300);
  };

  thumb.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    geom();
    drag = { dy: e.clientY - thumbY };
    thumb.setPointerCapture(e.pointerId);
    bar.classList.add("is-drag", "is-awake");
    root.classList.add("is-sbar-drag");
  });
  thumb.addEventListener("pointermove", (e) => {
    if (!drag) return;
    put(e.clientY - drag.dy);
    scrollToY(((thumbY - INSET) / room) * docMax);
  });
  const release = () => {
    if (!drag) return;
    drag = null;
    bar.classList.remove("is-drag");
    root.classList.remove("is-sbar-drag");
    wake();
    queue();
  };
  thumb.addEventListener("pointerup", release);
  thumb.addEventListener("pointercancel", release);
  thumb.addEventListener("lostpointercapture", release);
  /* a press on the track glides there */
  bar.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target === thumb) return;
    e.preventDefault();
    geom();
    scrollToY(Math.min(1, Math.max(0, (e.clientY - INSET - thumbH / 2) / room)) * docMax);
    wake();
  });
  bar.addEventListener("pointerenter", wake);

  addEventListener("scroll", () => { queue(); wake(); }, { passive: true });
  addEventListener("resize", () => { geom(); queue(); });
  if ("ResizeObserver" in window) new ResizeObserver(() => { geom(); queue(); }).observe(document.body);
  geom();
  place();
}
