/* ============================================================
   js/sections/testimonials.js — Render testimoni pelanggan
   ============================================================ */

const FawniaTestimonialsSection = {
  render() {
    const grid = document.querySelector("#testimonial-grid");
    if (!grid) return;
    const items = FawniaStore.getVisibleTestimonials();

    if (!items.length) {
      grid.innerHTML = `<p class="empty-note">Belum ada testimoni.</p>`;
      return;
    }

    grid.innerHTML = items
      .map(
        (t) => `
      <article class="testimonial">
        <div class="stars">${FawniaUtils.stars(t.rating)}</div>
        <p>“${FawniaUtils.esc(t.text)}”</p>
        <strong>${FawniaUtils.esc(t.name)}</strong>
      </article>`,
      )
      .join("");
  },
};

window.FawniaTestimonialsSection = FawniaTestimonialsSection;
