/* ============================================================
   js/sections/shipping-payment.js — Info metode pengiriman & pembayaran
   ============================================================ */

const FawniaInfoSection = {
  renderShipping() {
    const grid = document.querySelector("#shipping-grid");
    if (!grid) return;
    const settings = FawniaStore.getSettings();
    grid.innerHTML = FAWNIA_SHIPPING.map(
      (s) => `
      <article class="info-card">
        <i data-lucide="truck"></i>
        <h3>${FawniaUtils.esc(s.label)}</h3>
        <p>${FawniaUtils.esc(s.note)}</p>
        <strong>${s.cost === 0 ? "Gratis" : FawniaUtils.rupiah(s.cost)}</strong>
      </article>`,
    ).join("");
    const note = document.querySelector("#shipping-note");
    if (note) note.textContent = settings.shippingNote;
    FawniaUI.icons();
  },

  renderPayments() {
    const grid = document.querySelector("#payment-grid");
    if (!grid) return;
    grid.innerHTML = FAWNIA_PAYMENTS.map(
      (p) => `
      <article class="info-card">
        <i data-lucide="${p.id === "cod" ? "banknote" : p.id === "qris" ? "qr-code" : "credit-card"}"></i>
        <h3>${FawniaUtils.esc(p.label)}</h3>
        <p>${FawniaUtils.esc(p.note)}</p>
      </article>`,
    ).join("");
    FawniaUI.icons();
  },
};

window.FawniaInfoSection = FawniaInfoSection;
