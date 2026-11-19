/* ==========================================================================
   Pickers: a button and a list of our own — the browser's grey list is not
   ours. makePick(root, { items, grid, search, onPick }); root carries
   data-pick (the field's name), data-label and data-empty.
   ========================================================================== */
export function makePick(root, { items, grid = false, search = false, onPick }) {
  const label = root.dataset.label, empty = root.dataset.empty || "Seçin", name = root.dataset.pick;
  root.innerHTML = `<button type="button" class="pick__btn" aria-haspopup="listbox" aria-expanded="false"><span class="pick__label">${label}</span><span class="pick__value is-empty">${empty}</span><svg class="pick__chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button>
    <input type="hidden" name="${name}"><div class="pick__pop" hidden>${search ? '<input class="pick__search" type="search" placeholder="' + label + ' ara…" aria-label="' + label + ' ara" autocomplete="off" enterkeyhint="search">' : ""}<div class="pick__list${grid ? " is-grid" : ""}" role="listbox" aria-label="${label}"></div></div>`;
  const btn = root.querySelector(".pick__btn"), val = root.querySelector(".pick__value"), input = root.querySelector('input[type="hidden"]');
  const pop = root.querySelector(".pick__pop"), list = root.querySelector(".pick__list"), find = root.querySelector(".pick__search");
  let active = -1, shown = [], closing = 0;

  const render = () => {
    const q = (find ? find.value : "").trim().toLocaleLowerCase("tr");
    shown = items().filter((o) => !q || o.label.toLocaleLowerCase("tr").includes(q));
    list.innerHTML = shown.length ? shown.map((o, i) => `<button type="button" class="pick__opt" role="option" data-i="${i}" aria-selected="${o.value === input.value}">${o.label}</button>`).join("") : '<p class="pick__none">Sonuç yok</p>';
    active = shown.findIndex((o) => o.value === input.value);
  };
  const mark = () => list.querySelectorAll(".pick__opt").forEach((b, i) => b.classList.toggle("is-active", i === active));
  const open = () => {
    if (btn.disabled) return;
    document.querySelectorAll(".pick.is-open").forEach((p) => p !== root && p.__close && p.__close());
    clearTimeout(closing);
    render();
    /* the list opens to the side with room, never past the screen's edge or under the header, and always
       right at the field that opened it. On phones the field is static so the list spans the whole quick
       bar; it is then pinned to this field's own edge (a second-row field's list covers the first row) */
    const r = btn.getBoundingClientRect();
    const below = innerHeight - r.bottom - 12, above = r.top - (document.querySelector("[data-hdr]")?.offsetHeight || 0) - 12;
    const up = below < 320 && above > below;
    pop.classList.toggle("is-up", up); pop.classList.toggle("is-down", !up);
    pop.style.maxHeight = Math.round(Math.max(180, Math.min(384, (up ? above : below) - 10))) + "px";
    if (getComputedStyle(root).position === "static") {
      const b = root.parentElement.getBoundingClientRect();
      pop.style.top = up ? "auto" : Math.round(r.bottom - b.top + 8) + "px";
      pop.style.bottom = up ? Math.round(b.bottom - r.top + 8) + "px" : "auto";
    } else pop.style.top = pop.style.bottom = "";
    pop.hidden = false;
    requestAnimationFrame(() => root.classList.add("is-open"));
    btn.setAttribute("aria-expanded", "true");
    if (find) find.focus({ preventScroll: true });
    const sel = list.querySelector('[aria-selected="true"]');   /* the chosen one in view: the list scrolls, the page does not */
    if (sel) list.scrollTop = sel.offsetTop - (list.clientHeight - sel.offsetHeight) / 2;
  };
  const close = (refocus) => {
    root.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    closing = setTimeout(() => { pop.hidden = true; if (find) find.value = ""; }, 280);
    if (refocus) btn.focus();
  };
  root.__close = () => close(false);
  const choose = (o) => {
    input.value = o.value;
    val.textContent = o.label; val.classList.remove("is-empty");
    close(true);
    if (onPick) onPick(o);
  };

  btn.addEventListener("click", () => (root.classList.contains("is-open") ? close(true) : open()));
  list.addEventListener("click", (e) => { const b = e.target.closest(".pick__opt"); if (b) choose(shown[+b.dataset.i]); });
  if (find) find.addEventListener("input", () => { render(); active = shown.length ? 0 : -1; mark(); });
  root.addEventListener("keydown", (e) => {
    if (!root.classList.contains("is-open")) { if (e.key === "ArrowDown" && e.target === btn) { e.preventDefault(); open(); } return; }
    if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = grid && !find ? 4 : 1;
      active = Math.max(0, Math.min(shown.length - 1, active + (e.key === "ArrowDown" ? step : -step)));
      mark(); const a = list.querySelector(".is-active"); if (a) a.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(shown[active]); }
  });
  document.addEventListener("pointerdown", (e) => { if (root.classList.contains("is-open") && !root.contains(e.target)) close(false); });

  return {
    set(value) { const o = items().find((x) => x.value === value); if (o) { input.value = o.value; val.textContent = o.label; val.classList.remove("is-empty"); } },
    clear(text) { input.value = ""; val.textContent = text || empty; val.classList.add("is-empty"); },
    disable(off) { btn.disabled = !!off; },
    value: () => input.value,
  };
}

