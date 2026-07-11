/* ==========================================================================
   AULIVE #57 — script.js
   Motor de navegação da apresentação (JavaScript puro, sem dependências).

   Compatível com três modos de execução:
     • st.components.v2 (isolate_styles=True): o Streamlit importa este módulo
       e chama o `export default`, passando `component.parentElement` (ShadowRoot).
     • Página autônoma: abrir presentation/index.html direto no navegador — o
       bloco de auto-boot detecta o deck no documento e inicializa.
     • Fallback st.components.v1 (documentado): o app.py remove tudo abaixo do
       marcador V2 e chama bootDeck(document) dentro do iframe.

   Todas as consultas ao DOM usam `root` (Document | ShadowRoot), nunca
   `document.getElementById`, para funcionar dentro do Shadow DOM.

   Os dados dos slides (títulos, tempos e notas) chegam pela constante global
   AULIVE_DATA, injetada pelo app.py a partir de presentation/slides.json.
   ========================================================================== */

const DATA = (typeof AULIVE_DATA !== "undefined") ? AULIVE_DATA : { slides: [], meta: {} };

/* -------------------------------------------------------------------------- */
function bootDeck(root) {
  if (window.__AULIVE_BOOTED__) return;
  window.__AULIVE_BOOTED__ = true;

  const $  = (sel) => root.querySelector(sel);
  const $$ = (sel) => Array.from(root.querySelectorAll(sel));

  const viewport = $("#deck");
  const stage    = $("#stage");
  if (!viewport || !stage) { window.__AULIVE_BOOTED__ = false; return; }

  /* Reparenta o host do Shadow DOM para <body>: garante que position:fixed do
     deck seja relativo à viewport (containers do Streamlit podem ter transform). */
  try {
    if (root.host && document.body && root.host.parentNode !== document.body) {
      document.body.appendChild(root.host);
      root.host.style.position = "static";
      root.host.style.display = "block";
    }
    if (root.host || root === document) {
      document.documentElement.style.background = "#070B12";
      document.body.style.margin = "0";
    }
  } catch (e) { /* silencioso */ }

  const slides = $$(".slide");
  const total  = slides.length;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Estado */
  let current = 0;                 // índice do slide atual (0-based)
  let fragStep = 0;                // grupos de fragmentos revelados no slide atual
  const cumMin = [];               // tempo estimado acumulado por slide

  /* Tempo acumulado a partir de data-min */
  let acc = 0;
  slides.forEach((s, i) => { acc += parseInt(s.dataset.min || "0", 10); cumMin[i] = acc; });

  /* ----- Escala do palco fixo 1920x1080 ----- */
  function fitStage() {
    const w = viewport.clientWidth  || window.innerWidth;
    const h = viewport.clientHeight || window.innerHeight;
    const scale = Math.min(w / 1920, h / 1080);
    const x = Math.round((w - 1920 * scale) / 2);
    const y = Math.round((h - 1080 * scale) / 2);
    stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }
  window.addEventListener("resize", fitStage, { passive: true });
  document.addEventListener("fullscreenchange", fitStage);
  fitStage();

  /* ----- Fragmentos ----- */
  function fragmentGroups(slide) {
    const els = Array.from(slide.querySelectorAll(".fragment"));
    const map = new Map();
    els.forEach((el, i) => {
      const k = el.dataset.frag ? parseInt(el.dataset.frag, 10) : (1000 + i);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(el);
    });
    return Array.from(map.keys()).sort((a, b) => a - b).map((k) => map.get(k));
  }
  function applyFragments(slide, count) {
    const groups = fragmentGroups(slide);
    groups.forEach((grp, i) => grp.forEach((el) => el.classList.toggle("revealed", i < count)));
    return groups.length;
  }

  /* ----- Navegação de slides ----- */
  function showSlide(idx, { fromHash = false, revealAll = false } = {}) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides.forEach((s, i) => {
      const active = i === idx;
      s.classList.toggle("active", active);
      s.setAttribute("aria-hidden", active ? "false" : "true");
    });
    current = idx;
    const groups = fragmentGroups(slides[idx]);
    fragStep = revealAll ? groups.length : 0;
    applyFragments(slides[idx], fragStep);
    updateChrome();
    updateNotes();
    if (!fromHash) {
      const id = slides[idx].id;
      if (("#" + id) !== location.hash) history.replaceState(null, "", "#" + id);
    }
    if (overviewOpen) markCurrentThumb();
  }

  function next() {
    const groups = fragmentGroups(slides[current]);
    if (fragStep < groups.length) {
      fragStep++;
      applyFragments(slides[current], fragStep);
      updateChrome();
    } else if (current < total - 1) {
      showSlide(current + 1);
    }
  }
  function prev() {
    if (fragStep > 0) {
      fragStep--;
      applyFragments(slides[current], fragStep);
      updateChrome();
    } else if (current > 0) {
      showSlide(current - 1, { revealAll: true });
    }
  }
  const first = () => showSlide(0);
  const last  = () => showSlide(total - 1);

  /* ----- Chrome (progresso, contador, tempo) ----- */
  const elCur   = $("#cur");
  const elTotal = $("#total");
  const elEst   = $("#est-time");
  const elBar   = $("#progress-bar");
  function pad(n) { return String(n).padStart(2, "0"); }
  function updateChrome() {
    const groups = fragmentGroups(slides[current]);
    const fracFrag = groups.length ? (fragStep / groups.length) : 1;
    const pct = ((current + fracFrag) / total) * 100;
    if (elBar) elBar.style.width = pct.toFixed(2) + "%";
    if (elCur) elCur.textContent = pad(current + 1);
    if (elTotal) elTotal.textContent = String(total);
    if (elEst) elEst.textContent = String(cumMin[current] || 0);
  }

  /* ----- Notas do apresentador ----- */
  const notesEl   = $("#notes");
  const notesBody = $("#notes-body");
  let notesOpen = false;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
  function updateNotes() {
    if (!notesBody) return;
    const data = (DATA.slides && DATA.slides[current]) || null;
    if (!data || !data.notes) {
      notesBody.innerHTML = `<p class="notes-empty">Sem notas para este slide.</p>`;
      return;
    }
    const n = data.notes;
    const talk = Array.isArray(n.talk) ? `<ul>${n.talk.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
    notesBody.innerHTML = `
      <h3>${esc(data.n)}. ${esc(data.title)}</h3>
      <div class="meta">${esc(n.time || "")}</div>
      ${n.goal ? `<section><h4>Objetivo</h4><p>${esc(n.goal)}</p></section>` : ""}
      ${talk ? `<section><h4>Pontos de fala</h4>${talk}</section>` : ""}
      ${n.transition ? `<section><h4>Transição</h4><p>${esc(n.transition)}</p></section>` : ""}
      ${n.caution ? `<section class="caution"><h4>Atenção — não generalizar</h4><p>${esc(n.caution)}</p></section>` : ""}
      ${n.visual ? `<section><h4>Recurso visual</h4><p>${esc(n.visual)}</p></section>` : ""}`;
  }
  function toggleNotes(force) {
    notesOpen = (force === undefined) ? !notesOpen : force;
    notesEl.classList.toggle("open", notesOpen);
    notesEl.setAttribute("aria-hidden", notesOpen ? "false" : "true");
    if (notesOpen) { notesEl.setAttribute("tabindex", "-1"); notesEl.focus(); }
  }

  /* ----- Overview (visão geral) ----- */
  const overviewEl   = $("#overview");
  const overviewGrid = $("#overview-grid");
  let overviewOpen = false;
  let thumbsBuilt = false;
  function buildThumbs() {
    if (thumbsBuilt || !overviewGrid) return;
    slides.forEach((s, i) => {
      const data = (DATA.slides && DATA.slides[i]) || {};
      const thumb = document.createElement("button");
      thumb.className = "thumb";
      thumb.setAttribute("aria-label", `Ir para o slide ${i + 1}: ${data.title || ""}`);
      thumb.dataset.idx = String(i);
      const wrap = document.createElement("div");
      wrap.className = "mini-wrap";
      const clone = s.cloneNode(true);
      clone.classList.add("active");
      clone.removeAttribute("id");
      wrap.appendChild(clone);
      thumb.innerHTML = `<span class="badge">${pad(i + 1)}</span><span class="tt">${esc(data.title || s.getAttribute("aria-label") || "")}</span>`;
      thumb.appendChild(wrap);
      thumb.addEventListener("click", () => { showSlide(i); toggleOverview(false); });
      overviewGrid.appendChild(thumb);
    });
    thumbsBuilt = true;
    requestAnimationFrame(scaleThumbs);
  }
  function scaleThumbs() {
    $$(".thumb .mini-wrap").forEach((wrap) => {
      const tw = wrap.parentElement.clientWidth;
      wrap.style.transform = `scale(${tw / 1920})`;
    });
  }
  function markCurrentThumb() {
    $$(".thumb").forEach((t) => t.classList.toggle("current", parseInt(t.dataset.idx, 10) === current));
  }
  function toggleOverview(force) {
    overviewOpen = (force === undefined) ? !overviewOpen : force;
    if (overviewOpen) { buildThumbs(); scaleThumbs(); markCurrentThumb(); }
    overviewEl.classList.toggle("open", overviewOpen);
    if (overviewOpen) { overviewEl.setAttribute("tabindex", "-1"); overviewEl.focus(); }
  }

  /* ----- Ajuda ----- */
  const helpEl = $("#help");
  let helpOpen = false;
  function toggleHelp(force) {
    helpOpen = (force === undefined) ? !helpOpen : force;
    helpEl.classList.toggle("open", helpOpen);
    if (helpOpen) { helpEl.setAttribute("tabindex", "-1"); helpEl.focus(); }
  }

  /* ----- Cronômetro ----- */
  const timerEl  = $("#timer");
  const clockEl  = $("#clock");
  const tbarFill = $("#tbar-fill");
  const TARGET   = 40 * 60; // 40 minutos
  let timerVisible = false, timerRunning = false, elapsed = 0, tick = null;
  function renderClock() {
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    clockEl.textContent = `${pad(m)}:${pad(s)}`;
    clockEl.classList.toggle("over", elapsed > TARGET);
    if (tbarFill) tbarFill.style.width = Math.min(elapsed / TARGET, 1) * 100 + "%";
  }
  function timerToggleRun(force) {
    timerRunning = (force === undefined) ? !timerRunning : force;
    if (timerRunning) {
      if (!timerVisible) showTimer(true);
      tick = setInterval(() => { elapsed++; renderClock(); }, 1000);
      $("#t-start").textContent = "⏸";
    } else {
      clearInterval(tick); tick = null;
      $("#t-start").textContent = "▶";
    }
  }
  function timerReset() { elapsed = 0; renderClock(); }
  function showTimer(force) {
    timerVisible = (force === undefined) ? !timerVisible : force;
    timerEl.classList.toggle("show", timerVisible);
  }
  renderClock();

  /* ----- Tela cheia ----- */
  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        (viewport.requestFullscreen ? viewport.requestFullscreen() : Promise.reject()).catch(() => {});
      } else {
        document.exitFullscreen();
      }
    } catch (e) { /* alguns hosts bloqueiam fullscreen */ }
  }

  /* ----- Ações dos botões ----- */
  const actions = {
    prev, next,
    overview: () => toggleOverview(),
    notes: () => toggleNotes(),
    timer: () => showTimer(),
    fullscreen: toggleFullscreen,
    help: () => toggleHelp(),
  };
  $$("[data-act]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); const a = btn.dataset.act; if (actions[a]) actions[a](); });
  });
  $("#t-start").addEventListener("click", () => timerToggleRun());
  $("#t-reset").addEventListener("click", timerReset);
  overviewEl.addEventListener("click", (e) => { if (e.target === overviewEl) toggleOverview(false); });
  helpEl.addEventListener("click", (e) => { if (e.target === helpEl) toggleHelp(false); });

  /* ----- Teclado ----- */
  function anyPanelOpen() { return overviewOpen || helpOpen; }
  document.addEventListener("keydown", (e) => {
    const k = e.key;
    // Fechar painéis com Esc
    if (k === "Escape") {
      if (helpOpen) return toggleHelp(false);
      if (overviewOpen) return toggleOverview(false);
      if (notesOpen) return toggleNotes(false);
      return;
    }
    if (k === "?" || (k === "/" && e.shiftKey)) { e.preventDefault(); return toggleHelp(); }

    switch (k) {
      case "ArrowRight":
      case "PageDown":
      case " ":
      case "Spacebar":
      case "Enter":
        e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case "ArrowDown": e.preventDefault(); next(); break;
      case "ArrowUp": e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); first(); break;
      case "End": e.preventDefault(); last(); break;
      case "f": case "F": toggleFullscreen(); break;
      case "o": case "O": e.preventDefault(); toggleOverview(); break;
      case "n": case "N": toggleNotes(); break;
      case "t": e.preventDefault(); showTimer(); break;
      case "T": e.preventDefault(); timerToggleRun(); break;   // Shift+T inicia/pausa
      default: break;
    }
  });

  /* ----- Toque (swipe) ----- */
  let tx = 0, ty = 0;
  viewport.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY;
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (anyPanelOpen()) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* ----- Auto-hide de cursor e controles ----- */
  let idleTimer = null;
  function activity() {
    viewport.classList.remove("idle", "hide-cursor");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!anyPanelOpen() && !notesOpen) viewport.classList.add("idle", "hide-cursor");
    }, 3500);
  }
  viewport.addEventListener("mousemove", activity, { passive: true });
  viewport.addEventListener("touchstart", activity, { passive: true });
  activity();

  /* ----- Sincronização com o hash da URL ----- */
  function slideIndexFromHash() {
    const m = (location.hash || "").match(/slide-(\d+)/);
    if (!m) return -1;
    const idx = parseInt(m[1], 10) - 1;
    return (idx >= 0 && idx < total) ? idx : -1;
  }
  window.addEventListener("hashchange", () => {
    const idx = slideIndexFromHash();
    if (idx >= 0 && idx !== current) showSlide(idx, { fromHash: true });
  });

  /* ----- Inicialização ----- */
  if (elTotal) elTotal.textContent = String(total);
  const startIdx = slideIndexFromHash();
  showSlide(startIdx >= 0 ? startIdx : 0, { fromHash: startIdx >= 0 });

  // Reescala miniaturas ao redimensionar (caso a visão geral esteja aberta)
  window.addEventListener("resize", () => { if (overviewOpen) scaleThumbs(); }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* Auto-boot em página autônoma. No Streamlit v2 o deck vive no Shadow DOM,
   então esta consulta ao documento não encontra nada e é ignorada.           */
function __standaloneBoot() {
  if (window.__AULIVE_BOOTED__) return;
  if (document.querySelector && document.querySelector(".deck-viewport")) bootDeck(document);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", __standaloneBoot);
} else {
  __standaloneBoot();
}

/* __AULIVE_V2_ENTRY__ — o app.py remove tudo abaixo desta linha no fallback v1. */
export default function (component) {
  bootDeck(component.parentElement);
}
