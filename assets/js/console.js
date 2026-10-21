/* ============================================================================
   CLEARGLASS // SENTINEL COMMAND CONSOLE — micro-interactions
   Vanilla JS, zero dependencies. All motion respects prefers-reduced-motion.
   ========================================================================== */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ─── PageVisibility: pause CSS animations on heavy elements ─── */
  const PAUSEABLE = ".field__scan, .radar__sweep, .glass--pulse";
  const setAnimPause = (paused) => {
    document.querySelectorAll(PAUSEABLE).forEach((el) => {
      el.style.animationPlayState = paused ? "paused" : "";
    });
  };
  document.addEventListener("visibilitychange", () => setAnimPause(document.hidden));

  /* ---------------------------------------------- 1. Click impact ripple */
  // Layered, depth-aware ripple originating from the pointer.
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn || btn.hasAttribute("disabled") || btn.classList.contains("is-loading")) return;
    if (reduceMotion) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.1;
    const ring = document.createElement("span");
    ring.className = "ripple";
    ring.style.width = ring.style.height = `${size}px`;
    ring.style.left = `${e.clientX - r.left - size / 2}px`;
    ring.style.top  = `${e.clientY - r.top  - size / 2}px`;
    btn.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove());
  });

  /* ----------------------------------- 2. Pointer parallax / perspective tilt */
  // Subtle, engineered tilt on elements tagged [data-tilt].
  if (!reduceMotion) {
    const MAX = 6; // degrees
    $$("[data-tilt]").forEach((el) => {
      let raf = null;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform =
            `perspective(900px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg)`;
        });
      };
      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = "";
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", reset);
    });

    /* background bloom parallax tied to pointer (very subtle, rAF-debounced) */
    const blooms = $$(".field__bloom");
    if (blooms.length) {
      let bloomRaf = null, bx = 0, by = 0;
      window.addEventListener("pointermove", (e) => {
        bx = e.clientX / window.innerWidth - 0.5;
        by = e.clientY / window.innerHeight - 0.5;
        if (bloomRaf) return;
        bloomRaf = requestAnimationFrame(() => {
          bloomRaf = null;
          blooms.forEach((b, i) => {
            const depth = (i + 1) * 10;
            b.style.transform = `translate(${(bx * depth).toFixed(2)}px, ${(by * depth).toFixed(2)}px)`;
          });
        });
      }, { passive: true });
    }
  }

  /* ----------------------------------------- 3. Reveal-on-scroll (IO) */
  const reveals = $$("[data-reveal]");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const d = en.target.dataset.delay || 0;
            setTimeout(() => en.target.classList.add("is-in"), d);
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ------------------------------------- 4. Animated metric counters */
  const counters = $$("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
    const dur = 1400, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => cio.observe(el));
    }
  }

  /* -------------- 4b. Sparkline path-length + metric reveal class ------- */
  // Pre-measure each sparkline path length so CSS can animate stroke-dashoffset.
  // Also adds .is-in to the parent .metric tile (for the data-pulse keyframe).
  $$(".metric__spark path").forEach((path) => {
    try {
      const len = Math.ceil(path.getTotalLength());
      path.style.setProperty("--spark-len", len);
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    } catch (e) { /* SVG not yet in DOM — skip */ }
  });
  if (!reduceMotion && "IntersectionObserver" in window) {
    const sparkIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          sparkIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    $$(".metric").forEach((m) => sparkIO.observe(m));
  } else {
    $$(".metric").forEach((m) => m.classList.add("is-in"));
  }

  /* ------------------------------------- 5. Telemetry bars fill on view */
  const bars = $$(".bar > span[data-fill]");
  const cioBars = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.style.width = en.target.dataset.fill + "%";
        cioBars.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 }) : null;
  bars.forEach((b) => { if (cioBars) cioBars.observe(b); else b.style.width = b.dataset.fill + "%"; });

  /* ----------------------------------------------- 6. Live mission clock */
  const clock = $("[data-clock]");
  if (clock) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clock.textContent =
        `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
    };
    tick(); setInterval(tick, 1000);
  }

  /* --------------------------------------------- 7. Live system log feed */
  const logEl = $("[data-log]");
  if (logEl) {
    const events = [
      ["sys",  "Kernel handshake verified — <b>SENTINEL-7</b> online"],
      ["ok",   "Threat surface scan complete — <b>0 critical</b>"],
      ["info", "Ingest pipeline throughput <b>1.42M ev/s</b>"],
      ["ok",   "Autonomous agent <b>ARTEMIS</b> reached consensus"],
      ["info", "Telemetry sync with <b>node-cluster/eu-west</b>"],
      ["warn", "Latency spike on <b>edge-node 14</b> — auto-rerouted"],
      ["sys",  "Model weights hot-swapped — <b>v10.1 PROMETHEUS</b>"],
      ["ok",   "Audit ledger sealed — block <b>#48,213</b>"],
      ["info", "Predictive engine confidence <b>0.991</b>"],
      ["sys",  "Encryption rotation complete — <b>AES-256/GCM</b>"],
      ["ok",   "Simulation grid converged in <b>312ms</b>"],
      ["info", "Operator routing table rebalanced"],
    ];
    const stamp = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    const MAX_LINES = 7;
    const push = (tag, msg) => {
      const line = document.createElement("div");
      line.className = "log__line";
      line.innerHTML =
        `<span class="log__time">${stamp()}</span>` +
        `<span class="log__tag ${tag}">${tag}</span>` +
        `<span class="log__msg">${msg}</span>`;
      logEl.prepend(line);
      while (logEl.children.length > MAX_LINES) logEl.lastElementChild.remove();
    };
    // seed initial entries
    events.slice(0, MAX_LINES).reverse().forEach(([t, m]) => push(t, m));
    if (!reduceMotion) {
      let i = 0;
      let logTimer = null;
      const pushNext = () => { const [t, m] = events[i % events.length]; i++; push(t, m); };
      const startLog = () => { if (!logTimer) logTimer = setInterval(pushNext, 3200); };
      const stopLog  = () => { clearInterval(logTimer); logTimer = null; };
      startLog();
      // Pause the feed while the tab is hidden — saves CPU in background tabs.
      document.addEventListener("visibilitychange", () => document.hidden ? stopLog() : startLog());
    }
  }

  /* --------------------------------------------- 8. Mobile nav toggle */
  const toggle = $("[data-nav-toggle]");
  const nav = $("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* --------------------------- 9. Command button demo loading state */
  $$("[data-loading-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-loading")) return;
      btn.classList.add("is-loading");
      const label = $(".btn__label", btn);
      const prev = label ? label.textContent : "";
      setTimeout(() => {
        btn.classList.remove("is-loading");
        if (label) { label.textContent = "ENGAGED"; setTimeout(() => (label.textContent = prev), 1400); }
      }, 1900);
    });
  });

  /* ----------------------- 10. Sparkline SVG path draw-in on scroll */
  // Observes each .metric__spark SVG; when it enters the viewport the child
  // <path> gets stroke-dashoffset animated from its total length → 0 (fully drawn).
  // Without JS, sparklines show as normal static lines (safe fallback).
  const sparkSvgs = $$(".metric__spark");
  if (sparkSvgs.length && !reduceMotion && "IntersectionObserver" in window) {
    sparkSvgs.forEach((svg) => {
      const path = svg.querySelector("path");
      if (!path) return;
      try {
        const len = Math.ceil(path.getTotalLength());
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      } catch (_) { /* no-op if element not yet laid out */ }
    });
    const sparkIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const path = en.target.querySelector("path");
        if (path) path.classList.add("is-drawn");
        sparkIO.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    sparkSvgs.forEach((svg) => sparkIO.observe(svg));
  }

})();
