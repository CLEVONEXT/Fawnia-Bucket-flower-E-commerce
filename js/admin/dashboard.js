/* ============================================================
   js/admin/dashboard.js — Ringkasan data admin
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelector("#dashboard-stats");
  if (!stats) return;

  const products = FawniaStore.getProducts();
  const orders = FawniaStore.getOrders();
  const testimonials = FawniaStore.getTestimonials();
  const messages = (() => {
    try {
      return JSON.parse(localStorage.getItem("fawnia_messages")) || [];
    } catch (e) {
      return [];
    }
  })();
  const omzet = orders
    .filter((o) => o.status !== "Dibatalkan")
    .reduce((s, o) => s + FawniaStore.orderTotal(o), 0);

  stats.innerHTML = `
    <div><span>Total Produk</span><strong>${products.length}</strong></div>
    <div><span>Total Galeri</span><strong>${FawniaStore.getGallery().length}</strong></div>
    <div><span>Testimoni</span><strong>${testimonials.length}</strong></div>
    <div><span>Pesanan</span><strong>${orders.length}</strong></div>
    <div><span>Pesan Masuk</span><strong>${messages.length}</strong></div>
    <div><span>Estimasi Omzet</span><strong class="sm">${FawniaUtils.rupiah(omzet)}</strong></div>`;

  const latest = document.querySelector("#latest-orders");
  if (latest) {
    const recent = orders.slice(0, 5);
    latest.innerHTML = recent.length
      ? recent
          .map(
            (o) => `<div class="mini-row">
              <b>${FawniaUtils.esc(o.id)} · ${FawniaUtils.esc(o.name)}</b>
              <span>${FawniaUtils.esc(o.productName)} — ${FawniaUtils.rupiah(FawniaStore.orderTotal(o))}</span>
            </div>`,
          )
          .join("")
      : `<p class="muted">Belum ada pesanan. Pesanan dari form website akan tampil di sini.</p>`;
  }
});
