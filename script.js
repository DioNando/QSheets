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

  /* ---------- Lightbox démo (vidéo) ---------- */
  const lightbox = document.getElementById("demoLightbox");
  if (lightbox) {
    const demoVideo = document.getElementById("demoVideo");
    const openLightbox = () => {
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (demoVideo) demoVideo.pause();
    };
    // déclencheurs d'ouverture
    document.querySelectorAll("[data-demo]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openLightbox();
      })
    );
    // fermeture (croix + fond)
    lightbox.querySelectorAll("[data-close]").forEach((el) =>
      el.addEventListener("click", closeLightbox)
    );
    // fermeture au clavier (Échap)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }

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

  /* ---------- Révélation animée au défilement (anime.js) ---------- */
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Catalogue de variantes d'animation
  const VARIANTS = {
    up: { opacity: [0, 1], translateY: [34, 0], easing: "easeOutCubic", duration: 700 },
    left: { opacity: [0, 1], translateX: [-52, 0], easing: "easeOutCubic", duration: 750 },
    right: { opacity: [0, 1], translateX: [52, 0], easing: "easeOutCubic", duration: 750 },
    zoom: { opacity: [0, 1], scale: [0.9, 1], easing: "easeOutBack", duration: 750 },
    pop: { opacity: [0, 1], translateY: [40, 0], scale: [0.96, 1], easing: "easeOutBack", duration: 800 },
  };

  // Association sélecteur → variante (l'ordre n'importe pas, chaque élément ne reçoit qu'une variante)
  const GROUPS = [
    { sel: ".section__head", v: "up" },
    { sel: ".compare__card--bad", v: "left" },
    { sel: ".compare__card--good", v: "right" },
    { sel: ".step", v: "up" },
    { sel: ".prod", v: "zoom" },
    { sel: ".team__card", v: "pop" },
    { sel: ".price", v: "zoom" },
    { sel: ".client", v: "zoom" },
    { sel: ".faq__item", v: "left" },
    { sel: ".philo", v: "up" },
    { sel: ".prod-foot", v: "up" },
    { sel: ".cta__inner", v: "up" },
  ];

  const revealTargets = [];
  GROUPS.forEach(({ sel, v }) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.dataset.variant) return; // déjà assigné par un sélecteur plus spécifique
      el.dataset.variant = v;
      revealTargets.push(el);
    });
  });

  if (window.anime && "IntersectionObserver" in window && !reduceMotion) {
    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.willChange = "opacity, transform";
    });

    const io = new IntersectionObserver(
      (entries) => {
        const batch = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target);
        if (!batch.length) return;
        batch.forEach((el) => io.unobserve(el));

        // on regroupe par variante pour appliquer le bon effet + cascade
        const byVariant = {};
        batch.forEach((el) => {
          const v = el.dataset.variant || "up";
          (byVariant[v] = byVariant[v] || []).push(el);
        });

        Object.keys(byVariant).forEach((v) => {
          anime({
            targets: byVariant[v],
            ...VARIANTS[v],
            delay: anime.stagger(90),
          });
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => (el.style.opacity = "1"));
  }

  /* ---------- Animation d'entrée du hero (au chargement) ---------- */
  const heroBits = document.querySelectorAll(
    ".hero__content > *, .hero__img, .hero__logos img"
  );
  if (window.anime && !reduceMotion && heroBits.length) {
    heroBits.forEach((el) => (el.style.opacity = "0"));
    anime
      .timeline({ easing: "easeOutCubic" })
      .add({
        targets: ".hero__content > *",
        opacity: [0, 1],
        translateY: [26, 0],
        duration: 700,
        delay: anime.stagger(110),
      })
      .add(
        {
          targets: ".hero__img",
          opacity: [0, 1],
          scale: [0.92, 1],
          duration: 900,
          easing: "easeOutQuad",
        },
        "-=600"
      )
      .add(
        {
          targets: ".hero__logos img",
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 600,
          delay: anime.stagger(70),
        },
        "-=500"
      );
  }
})();
