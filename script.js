/* ============================================================
   QSheets — interactions
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const hasAnime = !!window.anime && !reduceMotion;

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

  /* ---------- FAQ : accordéon animé (ouverture/fermeture) ---------- */
  const faqItems = document.querySelectorAll(".faq__item");

  const openFaq = (item) => {
    const panel = item.querySelector("p");
    const icon = item.querySelector(".faq__icon");
    item.setAttribute("open", "");
    if (!hasAnime || !panel) return;
    anime.remove(panel);
    const target = panel.scrollHeight;
    anime({
      targets: panel,
      height: [0, target],
      opacity: [0, 1],
      marginTop: [0, 16],
      duration: 360,
      easing: "easeOutCubic",
      complete: () => {
        panel.style.height = "auto";
      },
    });
    if (icon) anime({ targets: icon, rotate: [0, 45], duration: 300, easing: "easeOutCubic" });
  };

  const closeFaq = (item) => {
    const panel = item.querySelector("p");
    const icon = item.querySelector(".faq__icon");
    if (!hasAnime || !panel) {
      item.removeAttribute("open");
      return;
    }
    anime.remove(panel);
    anime({
      targets: panel,
      height: [panel.scrollHeight, 0],
      opacity: [1, 0],
      marginTop: [16, 0],
      duration: 300,
      easing: "easeInCubic",
      complete: () => {
        item.removeAttribute("open");
        panel.style.height = "";
        panel.style.opacity = "";
        panel.style.marginTop = "";
      },
    });
    if (icon) anime({ targets: icon, rotate: [45, 0], duration: 300, easing: "easeInCubic" });
  };

  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    summary.addEventListener("click", (e) => {
      e.preventDefault(); // on pilote l'ouverture nous-mêmes (pour l'animation)
      const isOpen = item.hasAttribute("open");
      // ouverture exclusive : on ferme les autres
      faqItems.forEach((other) => {
        if (other !== item && other.hasAttribute("open")) closeFaq(other);
      });
      isOpen ? closeFaq(item) : openFaq(item);
    });
  });

  /* ---------- Révélation animée au défilement (anime.js) ---------- */
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

  /* ---------- Barre de son : égaliseur animé (SVG) ---------- */
  const waveSvg = document.querySelector(".cta__wave");
  if (hasAnime && waveSvg) {
    const bars = waveSvg.querySelectorAll("path");
    const eq = anime({
      targets: bars,
      scaleY: [
        { value: () => anime.random(20, 100) / 100 },
        { value: () => anime.random(20, 100) / 100 },
        { value: () => anime.random(20, 100) / 100 },
      ],
      duration: 2000,
      delay: anime.stagger(16, { from: "center" }),
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
      autoplay: false,
    });
    // on ne joue l'animation que lorsque la barre est visible (perf)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? eq.play() : eq.pause()));
        },
        { threshold: 0.2 }
      ).observe(waveSvg);
    } else {
      eq.play();
    }
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

  /* ---------- Hero : flottement + parallaxe souris (desktop) ---------- */
  const heroEl = document.getElementById("hero");
  const heroImg = document.querySelector(".hero__img");
  const desktop = window.matchMedia("(min-width: 981px)").matches;

  if (heroEl && heroImg && desktop && !reduceMotion) {
    let tnx = 0, // cible normalisée (-0.5..0.5)
      tny = 0,
      nx = 0, // valeur lissée
      ny = 0,
      t = 0;

    heroEl.addEventListener("mousemove", (e) => {
      const r = heroEl.getBoundingClientRect();
      tnx = (e.clientX - r.left) / r.width - 0.5;
      tny = (e.clientY - r.top) / r.height - 0.5;
    });
    heroEl.addEventListener("mouseleave", () => {
      tnx = 0;
      tny = 0;
    });

    const tick = () => {
      t += 0.018;
      nx += (tnx - nx) * 0.06; // lissage du suivi souris
      ny += (tny - ny) * 0.06;
      const floatY = Math.sin(t) * 9; // flottement vertical continu
      // parallaxe amplifiée de l'illustration (±42px)
      const px = nx * 84;
      const py = ny * 84;
      heroImg.style.transform =
        "translate(" + px.toFixed(2) + "px," + (py + floatY).toFixed(2) + "px)";
      // le halo suit le curseur (décalage ±10%)
      heroEl.style.setProperty("--gx", (92 + nx * 20).toFixed(2) + "%");
      heroEl.style.setProperty("--gy", (2 + ny * 20).toFixed(2) + "%");
      requestAnimationFrame(tick);
    };
    // on démarre après l'animation d'entrée pour ne pas se chevaucher
    setTimeout(() => requestAnimationFrame(tick), window.anime ? 1700 : 0);
  }
})();
