/* ============================================================
   js/sections/gallery.js — Render galeri + lightbox
   ============================================================ */

const FawniaGallerySection = {
  render() {
    const grid = document.querySelector("#gallery-grid");
    if (!grid) return;
    const items = FawniaStore.getVisibleGallery();

    if (!items.length) {
      grid.innerHTML = `<p class="empty-note">Galeri belum tersedia.</p>`;
      return;
    }

    grid.innerHTML = items
      .map(
        (g, i) => `
      <button class="gallery-item" data-gallery="${i}" data-src="${FawniaUtils.esc(g.image)}" data-title="${FawniaUtils.esc(g.title)}" aria-label="Buka ${FawniaUtils.esc(g.title)}">
        ${FawniaUI.img(g.image, g.title, "gallery-img")}
        <span class="gallery-title">${FawniaUtils.esc(g.title)}</span>
      </button>`,
      )
      .join("");

    grid.querySelectorAll(".gallery-item").forEach((el) => {
      el.addEventListener("click", () =>
        FawniaUI.openLightbox(el.dataset.src, el.dataset.title),
      );
    });
  },
};

window.FawniaGallerySection = FawniaGallerySection;
