/* ============================================================
   js/main.js — Bootstrap landing page (marketplace)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const settings = FawniaStore.getSettings();

  const adminTrigger = document.querySelector("[data-admin-trigger]");
  if (adminTrigger) {
    let clicks = 0;
    let resetTimer;
    adminTrigger.addEventListener("click", (event) => {
      if (event.detail === 0) return;
      event.preventDefault();
      clicks += 1;
      clearTimeout(resetTimer);
      if (clicks === 3) {
        location.assign(adminTrigger.href);
        return;
      }
      resetTimer = setTimeout(() => {
        clicks = 0;
      }, 1200);
    });
  }

  /* --- Logo: pakai assets/img/fawnia-logo.png, fallback huruf F --- */
  FawniaUI.mountLogos();

  /* --- Kontak & link WA mengikuti pengaturan admin --- */
  const wa = FawniaUtils.waLink(
    settings.whatsapp,
    `Halo ${settings.businessName}, saya ingin bertanya tentang produk bucket & gift.`,
  );
  document.querySelectorAll("[data-wa-link]").forEach((a) => {
    a.href = wa;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* --- Section dinamis --- */
  FawniaProductsSection.init();
  FawniaGallerySection.render();
  FawniaTestimonialsSection.render();
  FawniaInfoSection.renderShipping();
  FawniaInfoSection.renderPayments();

  /* --- Keranjang: badge + drawer (init sudah jalan dari js/cart.js) --- */
  FawniaCart.updateBadge();
  document.addEventListener("fawnia:cart-changed", () => {
    FawniaCart.updateBadge();
    if (FawniaCart.isOpen()) FawniaCart.renderItems();
  });

  /* --- Tampilkan jumlah item di tombol checkout header --- */
  const checkoutCta = document.querySelector("#header-checkout");
  if (checkoutCta) {
    const sync = () => {
      const n = FawniaCart.count();
      checkoutCta.textContent = n > 0 ? `Checkout (${n})` : "Checkout";
    };
    sync();
    document.addEventListener("fawnia:cart-changed", sync);
  }

  /* --- Lightbox --- */
  FawniaUI.initLightbox();

  /* --- Navigasi aktif mengikuti section yang terlihat --- */
  const links = [...document.querySelectorAll(".nav-link,.bottom-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((a) =>
              a.classList.toggle(
                "active",
                a.getAttribute("href") === `#${entry.target.id}`,
              ),
            );
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* --- Header mengecil saat scroll --- */
  const header = document.querySelector(".site-header");
  window.addEventListener(
    "scroll",
    () => header?.classList.toggle("scrolled", window.scrollY > 12),
    { passive: true },
  );

  FawniaUI.icons();
});
