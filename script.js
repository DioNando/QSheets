/* ============================================================
   QSheets — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Nav : fond au scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile (burger) ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  // referme le menu après clic sur un lien
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Waveforms (barres générées) ---------- */
  document.querySelectorAll("[data-waveform]").forEach((wf) => {
    const count = parseInt(wf.dataset.waveform, 10) || 40;
    for (let i = 0; i < count; i++) {
      const bar = document.createElement("span");
      bar.className = "bar";
      // hauteur pseudo-aléatoire mais déterministe (motif sinusoïdal + variation)
      const base = Math.abs(Math.sin(i * 0.6)) * 60 + Math.abs(Math.sin(i * 1.7)) * 35;
      bar.style.height = Math.max(8, base + (i % 5) * 6) + "%";
      // quelques barres en vert, réparties
      if (i % 7 === 3 || i % 11 === 0) bar.classList.add("is-green");
      wf.appendChild(bar);
    }
  });

  /* ---------- FAQ : ouverture exclusive (accordéon) ---------- */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Révélation au défilement ---------- */
  const revealTargets = document.querySelectorAll(
    ".section__head, .compare__card, .step, .prod, .team__card, .price, .client, .faq__item"
  );
  if ("IntersectionObserver" in window) {
    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => io.observe(el));
  }
})();
