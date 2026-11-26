/* ============================================================
   js/motion.js — Smooth scroll (Lenis) + animasi masuk kartu (GSAP)
   Dimuat di halaman publik. Seluruh berkas lokal (js/vendor/), tidak
   bergantung CDN. Semua animasi dimatikan bila pengguna memilih
   "kurangi gerakan" pada sistem operasinya.
   ============================================================ */

const FawniaMotion = {
  reduced: false,
  lenis: null,

  init() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.startLenis();
    this.startCards();
    this.startSections();
  },

  /* ---------- Smooth scroll ----------
     Lenis hanya menggulir halaman utama. Panel yang punya scroll sendiri
     (drawer keranjang) dikecualikan lewat data-lenis-prevent di HTML. */
  startLenis() {
    if (this.reduced || typeof window.Lenis !== "function") return;
    this.lenis = new window.Lenis({ duration: 1.05, wheelMultiplier: 0.9 });
    window.FawniaLenis = this.lenis;

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    /* Saat drawer/cart dibuka, halaman dihentikan sementara agar tidak
       menggulir di belakang panel. */
    document.addEventListener("fawnia:scroll-lock", (e) => {
      if (e.detail?.locked) this.lenis?.stop();
      else this.lenis?.start();
    });

    /* Tautan jangkar memakai Lenis supaya tetap mulus. */
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      this.lenis.scrollTo(target, { offset: -80 });
    });
  },

  /* ---------- Kartu produk: masuk saat digulir, hover halus ---------- */
  startCards() {
    const grid = document.querySelector("#product-grid");
    if (!grid) return;

    if (this.reduced || !window.gsap) return;

    const gsap = window.gsap;
    const build = () => {
      const cards = grid.querySelectorAll(".product-card");
      if (!cards.length) return false;

      /* Jaring aman: apa pun yang terjadi pada animasi, kartu kembali terlihat
         setelah 1,2 detik. Mencegah produk "hilang" bila trigger tidak jalan. */
      clearTimeout(this._safety);
      this._safety = setTimeout(() => {
        grid.querySelectorAll(".product-card").forEach((c) => {
          if (getComputedStyle(c).opacity === "0") {
            c.style.opacity = "1";
            c.style.transform = "none";
          }
        });
      }, 1200);

      gsap.set(cards, { opacity: 0, y: 26 });

      if (!window.ScrollTrigger) {
        gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 });
        return true;
      }

      gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.07,
            ease: "power2.out",
            overwrite: true,
            clearProps: "transform",
          }),
      });

      /* Hover: kartu terangkat sedikit dan gambar membesar.
         Dibatasi ke perangkat dengan penunjuk presisi agar tidak macet di layar sentuh. */
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        cards.forEach((card) => {
          const img = card.querySelector(".product-img");
          const lift = gsap.to(card, {
            y: -6,
            duration: 0.3,
            ease: "power2.out",
            paused: true,
          });
          const zoom = img
            ? gsap.to(img, { scale: 1.05, duration: 0.5, ease: "power2.out", paused: true })
            : null;
          card.addEventListener("pointerenter", () => {
            lift.play();
            zoom?.play();
          });
          card.addEventListener("pointerleave", () => {
            lift.reverse();
            zoom?.reverse();
          });
        });
      }
      return true;
    };

    /* Produk di-render ulang setiap pencarian/keranjang berubah: pasang ulang. */
    if (!build()) {
      const observer = new MutationObserver(() => {
        observer.disconnect();
        build();
        observer.observe(grid, { childList: true });
      });
      observer.observe(grid, { childList: true });
    }
    new MutationObserver(() => window.ScrollTrigger?.refresh()).observe(grid, { childList: true });
  },

  /* ---------- Section: naik halus saat pertama terlihat ---------- */
  startSections() {
    if (this.reduced || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    document.querySelectorAll(".section-head").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    document.querySelectorAll(".gallery-item").forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        y: 20,
        duration: 0.55,
        delay: (i % 3) * 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    });
  },
};

window.FawniaMotion = FawniaMotion;

document.addEventListener("DOMContentLoaded", () => FawniaMotion.init());
