/* ==========================================================================
   The car, seen from above — every painted part a button
   --------------------------------------------------------------------------
   mountCar(el, { parts, onChange }) draws the diagram into el. A tap (or Enter)
   on a part opens a small menu of its four states; the choice colours the part
   and onChange receives the whole map { partId: state }. Glass, wheels and the
   body behind the panels are drawn but not pickable.
   ========================================================================== */
import { PARTS, STATES } from "./data.js";

const W = 260;
/* left-side panels; the right side is their mirror (x -> 260 - x) */
const LEFT = {
  "sol-on-camurluk": "M36,66 C38,54 44,50 50,50 L58,154 L36,158 Z",
  "sol-on-kapi": "M36,164 L60,160 L64,264 L36,264 Z",
  "sol-arka-kapi": "M36,270 L64,270 L62,362 L36,364 Z",
  "sol-arka-camurluk": "M36,370 L60,368 L52,450 C44,450 38,446 36,436 Z",
};
const CENTRE = {
  "on-tampon": "M64,24 C96,14 164,14 196,24 L206,44 C160,36 100,36 54,44 Z",
  "kaput": "M54,52 C100,44 160,44 206,52 L198,152 C160,146 100,146 62,152 Z",
  "tavan": "M76,214 C104,210 156,210 184,214 L184,320 C156,324 104,324 76,320 Z",
  "bagaj": "M64,368 C100,376 160,376 196,368 L204,444 C160,454 100,454 56,444 Z",
  "arka-tampon": "M54,452 C100,462 160,462 206,452 L198,480 C160,496 100,496 62,480 Z",
};
const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${W - +x},${y}`);
const SHAPES = { ...CENTRE, ...LEFT };
for (const [id, d] of Object.entries(LEFT)) SHAPES[id.replace(/^sol/, "sag")] = mirror(d);

const NAME = Object.fromEntries(PARTS);
const STATE = Object.fromEntries(STATES);

function svg() {
  const wheel = (x, y) => `<rect class="wheel" x="${x}" y="${y}" width="17" height="56" rx="6"/>`;
  const parts = PARTS.map(([id]) => `<path class="part" data-part="${id}" d="${SHAPES[id]}" tabindex="0" role="button"/>`).join("");
  return `<svg viewBox="0 0 ${W} 520" role="group" aria-label="Aracın parçaları">
    ${wheel(14, 84)}${wheel(W - 31, 84)}${wheel(14, 372)}${wheel(W - 31, 372)}
    <path class="body" d="M130,10 C190,10 222,30 226,80 L232,250 L228,430 C224,490 186,510 130,510 C74,510 36,490 32,430 L28,250 L34,80 C38,30 70,10 130,10 Z"/>
    <path class="body" d="M30,170 L12,176 L14,192 L32,188 Z"/><path class="body" d="${mirror("M30,170 L12,176 L14,192 L32,188 Z")}"/>
    <path class="glass" d="M64,158 C100,152 160,152 196,158 L186,208 C158,203 102,203 74,208 Z"/>
    <path class="glass" d="M74,326 C102,331 158,331 186,326 L194,362 C160,370 100,370 66,362 Z"/>
    ${parts}
    <path class="hl" d="M62,38 L86,31"/><path class="hl" d="${mirror("M62,38 L86,31")}"/>
    <path class="tl" d="M64,476 L88,484"/><path class="tl" d="${mirror("M64,476 L88,484")}"/>
  </svg>`;
}

export function mountCar(el, { parts = {}, onChange } = {}) {
  const state = { ...parts };
  el.innerHTML = svg() + `<div class="car__pop" role="dialog" aria-label="Parça durumu"><p></p>${STATES.map(([id, name]) =>
    `<button type="button" data-state="${id}" aria-pressed="false"><i class="sw sw--${id}"></i>${name}</button>`).join("")}</div>`;
  const pop = el.querySelector(".car__pop"), title = pop.querySelector("p");
  const box = el.querySelector("svg");
  let current = null;

  const paint = () => {
    el.querySelectorAll(".part").forEach((p) => {
      const s = state[p.dataset.part] || "orijinal";
      p.dataset.state = s;
      p.setAttribute("aria-label", `${NAME[p.dataset.part]}: ${STATE[s]}`);
    });
  };
  const close = (refocus) => {
    pop.classList.remove("is-open");
    if (current) { current.classList.remove("is-picked"); if (refocus) current.focus(); }
    current = null;
  };
  const open = (p) => {
    if (current === p) return close(true);
    if (current) current.classList.remove("is-picked");
    current = p;
    p.classList.add("is-picked");
    const id = p.dataset.part, s = state[id] || "orijinal";
    title.textContent = NAME[id];
    pop.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.state === s)));
    const k = box.clientWidth / W, b = p.getBBox();
    const x = Math.min(Math.max((b.x + b.width / 2) * k, 96), el.clientWidth - 96);
    const below = (b.y + b.height) * k + 10, above = b.y * k - 10;
    const room = box.clientHeight - below > 200;
    pop.style.left = x + "px";
    pop.style.top = room ? below + "px" : "auto";
    pop.style.bottom = room ? "auto" : el.clientHeight - above + "px";
    pop.classList.add("is-open");
    (pop.querySelector('[aria-pressed="true"]') || pop.querySelector("button")).focus({ preventScroll: true });
  };

  el.addEventListener("click", (e) => {
    const p = e.target.closest(".part");
    if (p) return open(p);
    const b = e.target.closest(".car__pop button");
    if (b && current) {
      state[current.dataset.part] = b.dataset.state;
      if (b.dataset.state === "orijinal") delete state[current.dataset.part];
      paint();
      close(true);
      if (onChange) onChange({ ...state });
    }
  });
  el.addEventListener("keydown", (e) => {
    const p = e.target.closest(".part");
    if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(p); }
    if (e.key === "Escape" && current) { e.preventDefault(); close(true); }
    if (pop.classList.contains("is-open") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const bs = [...pop.querySelectorAll("button")], i = bs.indexOf(document.activeElement);
      bs[(i + (e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length].focus();
    }
  });
  document.addEventListener("pointerdown", (e) => { if (current && !el.contains(e.target)) close(false); });
  paint();
  return {
    get: () => ({ ...state }),
    set: (next) => { for (const k of Object.keys(state)) delete state[k]; Object.assign(state, next); paint(); },
  };
}
