/* ============================================================
   js/admin/settings.js — Pengaturan toko (disimpan di localStorage)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#settings-form");
  if (!form) return;

  const settings = FawniaStore.getSettings();
  const show = (n, v) => {
    const el = form.querySelector(`[name="${n}"]`);
    if (el) el.value = v ?? "";
  };

  show("businessName", settings.businessName);
  show("tagline", settings.tagline);
  show("whatsapp", settings.whatsapp);
  show("instagram", settings.instagram);
  show("email", settings.email);
  show("address", settings.address);
  show("shippingNote", settings.shippingNote);
  show("bankAccount", settings.bankAccount);
  show("qrisNote", settings.qrisNote);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { ...settings };
    form.querySelectorAll("[name]").forEach((el) => {
      data[el.name] = el.value.trim();
    });
    FawniaStore.saveSettings(data);
    FawniaUtils.toast("Pengaturan disimpan");
  });

  /* Sinkronkan daftar pengiriman & pembayaran (read-only info) */
  const shippingBox = document.querySelector("#settings-shipping");
  if (shippingBox) {
    shippingBox.innerHTML = FAWNIA_SHIPPING.map(
      (s) =>
        `<div class="mini-row"><b>${FawniaUtils.esc(s.label)}</b><span>${s.cost === 0 ? "Gratis" : FawniaUtils.rupiah(s.cost)}</span></div>`,
    ).join("");
  }
  const paymentBox = document.querySelector("#settings-payment");
  if (paymentBox) {
    paymentBox.innerHTML = FAWNIA_PAYMENTS.map(
      (p) =>
        `<div class="mini-row"><b>${FawniaUtils.esc(p.label)}</b><span>${FawniaUtils.esc(p.note)}</span></div>`,
    ).join("");
  }

  /* Reset data demo */
  document.querySelector("#reset-data")?.addEventListener("click", () => {
    if (
      !FawniaAdmin.confirm(
        "Reset semua data (produk, galeri, testimoni, pesanan, pengaturan) ke default?",
      )
    )
      return;
    Object.values(FAWNIA_KEYS)
      .filter((k) => k !== FAWNIA_KEYS.admin)
      .forEach((k) => localStorage.removeItem(k));
    FawniaUtils.toast("Data dikembalikan ke default");
    setTimeout(() => location.reload(), 800);
  });
});
