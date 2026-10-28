/* ============================================================
   js/sections/checkout.js — Halaman checkout (pages/checkout.html)
   Ringkasan item keranjang + pengiriman + pembayaran.
   Setelah kirim: simpan pesanan, buat QR pembayaran, buka struk.
   ============================================================ */

const FawniaCheckout = {
  /* ---------- Render halaman checkout ---------- */
  init(rootSelector = "#checkout-page") {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const settings = FawniaStore.getSettings();
    FawniaUI.mountLogos();
    document.querySelectorAll("[data-wa-link]").forEach((a) => {
      a.href = FawniaUtils.waLink(settings.whatsapp, `Halo ${settings.businessName}, saya ingin bertanya.`);
    });

    /* State awal dari query ?id=xxx (setelah membuat pesanan) */
    const orderId = FawniaUtils.getParam("id");
    const done = FawniaUtils.getParam("done") === "1";
    if (done && orderId) {
      this.renderSuccess(root, FawniaStore.getOrders().find((o) => o.id === orderId));
      return;
    }

    const items = FawniaCart.items();
    if (!items.length) {
      root.innerHTML = `
        <div class="checkout-empty">
          <i data-lucide="shopping-cart"></i>
          <h1>Keranjang kamu masih kosong</h1>
          <p>Yuk, pilih bucket favoritmu dulu sebelum checkout.</p>
          <a class="btn btn-primary" href="../index.html#products">Belanja Sekarang</a>
        </div>`;
      FawniaUI.icons();
      return;
    }

    root.innerHTML = `
      <nav class="breadcrumbs">
        <a href="../index.html">Home</a> <span>›</span>
        <a href="../index.html#products">Produk</a> <span>›</span>
        <b>Checkout</b>
      </nav>
      <h1 class="checkout-h1">Checkout</h1>
      <div class="checkout-page-grid">
        <section class="checkout-items-panel">
          <h2><i data-lucide="shopping-bag"></i> Produk (${FawniaCart.count()})</h2>
          <div class="checkout-items">
            ${items.map((i) => `
              <div class="checkout-item">
                <span class="thumb">${FawniaUI.img(i.image, i.name)}</span>
                <div class="checkout-item-info"><b>${FawniaUtils.esc(i.name)}</b><small>${i.qty} x ${FawniaUtils.rupiah(i.price)}</small></div>
                <strong>${FawniaUtils.rupiah(i.price * i.qty)}</strong>
                <button type="button" class="cart-del" data-remove="${FawniaUtils.esc(i.id)}" aria-label="Hapus"><i data-lucide="trash-2"></i></button>
              </div>`).join("")}
          </div>
          <a class="text-link" href="../index.html#products"><i data-lucide="arrow-left"></i> Tambah produk lain</a>
        </section>

        <form id="checkout-form" class="checkout-form" novalidate>
          <h2><i data-lucide="clipboard-list"></i> Data Pengiriman</h2>
          <div class="form-row">
            <label class="field">Nama lengkap<input name="name" type="text" placeholder="Nama kamu" required></label>
            <label class="field">Nomor WhatsApp<input name="phone" type="tel" placeholder="0812xxxxxxx" required></label>
          </div>
          <div class="form-row">
            <label class="field">Metode pengiriman<select name="shipping" required></select></label>
            <label class="field">Metode pembayaran<select name="payment" required></select></label>
          </div>
          <label class="field">Alamat pengiriman<textarea name="address" rows="2" placeholder="Kosongkan jika ambil di toko"></textarea></label>
          <label class="field">Catatan (opsional)<textarea name="note" rows="2" placeholder="Warna, tema, ucapan, dll."></textarea></label>
          <div id="checkout-summary" class="order-summary"></div>
          <p class="error" id="checkout-error"></p>
          <button type="submit" class="btn btn-primary lg btn-block"><i data-lucide="credit-card"></i> Buat Pesanan &amp; Bayar</button>
          <a class="btn btn-ghost btn-block" style="margin-top:10px" id="checkout-wa"><i data-lucide="message-circle"></i> Pesan via WhatsApp</a>
        </form>
      </div>`;

    const form = root.querySelector("#checkout-form");
    const shippingSelect = form.querySelector('[name="shipping"]');
    const paymentSelect = form.querySelector('[name="payment"]');
    const summary = form.querySelector("#checkout-summary");

    shippingSelect.innerHTML = FAWNIA_SHIPPING.map(
      (s) => `<option value="${s.id}">${FawniaUtils.esc(s.label)} — ${s.cost === 0 ? "Gratis" : FawniaUtils.rupiah(s.cost)}</option>`,
    ).join("");
    paymentSelect.innerHTML = FAWNIA_PAYMENTS.map(
      (p) => `<option value="${p.id}">${FawniaUtils.esc(p.label)}</option>`,
    ).join("");

    const calc = () => {
      const subtotal = FawniaCart.subtotal();
      const shippingCost = FawniaStore.shippingCost(shippingSelect.value);
      const total = subtotal + shippingCost;
      summary.innerHTML = `
        <div><span>Subtotal (${FawniaCart.count()} produk)</span><strong>${FawniaUtils.rupiah(subtotal)}</strong></div>
        <div><span>Pengiriman</span><strong>${shippingCost === 0 ? "Gratis" : FawniaUtils.rupiah(shippingCost)}</strong></div>
        <div class="summary-total"><span>Total</span><strong>${FawniaUtils.rupiah(total)}</strong></div>`;
      return { subtotal, shippingCost, total };
    };
    form.addEventListener("change", calc);
    calc();

    /* Hapus item dari halaman checkout */
    root.addEventListener("click", (e) => {
      const del = e.target.closest("[data-remove]");
      if (!del) return;
      FawniaCart.remove(del.dataset.remove);
      FawniaUtils.toast("Produk dihapus");
      if (!FawniaCart.items().length) location.reload();
      else this.init(rootSelector);
    });

    const collect = () => {
      const { subtotal, shippingCost, total } = calc();
      return {
        items: FawniaCart.items(),
        productName: FawniaCart.items().map((i) => `${i.name} x${i.qty}`).join(", "),
        subtotal,
        shipping: shippingSelect.value,
        shippingCost,
        payment: paymentSelect.value,
        total,
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        address: form.querySelector('[name="address"]').value.trim(),
        note: form.querySelector('[name="note"]').value.trim(),
        source: "checkout-page",
        userId: FawniaUserAuth.current()?.id ?? null,
      };
    };

    const validate = (data) => {
      const error = form.querySelector("#checkout-error");
      if (!data.items.length) {
        error.textContent = "Keranjang masih kosong.";
        return false;
      }
      if (!data.name || data.phone.length < 8) {
        error.textContent = "Nama dan nomor WhatsApp (min. 8 digit) wajib diisi.";
        return false;
      }
      if (data.shipping !== "pickup" && !data.address) {
        error.textContent = "Alamat pengiriman wajib diisi untuk metode selain ambil di toko.";
        return false;
      }
      error.textContent = "";
      return true;
    };

    /* Kirim → simpan → halaman QR/struk */
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = collect();
      if (!validate(data)) return;
      const record = FawniaStore.addOrder(data);
      FawniaCart.clear();
      location.href = `checkout.html?done=1&id=${record.id}`;
    });

    /* Checkout via WhatsApp */
    form.querySelector("#checkout-wa").addEventListener("click", (e) => {
      e.preventDefault();
      const data = collect();
      if (!validate(data)) return;
      const lines = [
        `Halo ${settings.businessName}, saya ingin memesan:`,
        ...data.items.map((i) => `• ${i.name} x${i.qty} — ${FawniaUtils.rupiah(i.price * i.qty)}`),
        `• Pengiriman: ${FawniaStore.shippingLabel(data.shipping)}`,
        `• Pembayaran: ${FawniaStore.paymentLabel(data.payment)}`,
        `• Total: ${FawniaUtils.rupiah(data.total)}`,
        `• Nama: ${data.name}`,
        `• WhatsApp: ${data.phone}`,
        `• Alamat: ${data.address || "-"}`,
        data.note ? `• Catatan: ${data.note}` : "",
      ].filter(Boolean);
      window.open(FawniaUtils.waLink(settings.whatsapp, lines.join("\n")), "_blank");
    });

    FawniaUI.icons();
  },

  /* ---------- Halaman sukses: QR pembayaran + struk ---------- */
  renderSuccess(root, order) {
    const settings = FawniaStore.getSettings();
    if (!order) {
      root.innerHTML = `<p class="empty-note">Pesanan tidak ditemukan.</p>`;
      return;
    }
    const payment = FawniaStore.paymentLabel(order.payment);
    const total = FawniaStore.orderTotal(order);

    root.innerHTML = `
      <div class="receipt-wrap">
        <div class="receipt-success">
          <i data-lucide="check-circle-2"></i>
          <div>
            <h1>Pesanan berhasil dibuat!</h1>
            <p>Nomor pesanan <b>${FawniaUtils.esc(order.id)}</b> — admin akan konfirmasi via WhatsApp.</p>
          </div>
        </div>

        <div class="receipt-grid">
          <section class="receipt-card receipt-qr">
            <h2><i data-lucide="qr-code"></i> Pembayaran ${FawniaUtils.esc(payment)}</h2>
            <div class="qr-box">
              <img id="payment-qr" alt="QR pembayaran" src="">
            </div>
            <p class="qr-amount">Total tagihan: <b>${FawniaUtils.rupiah(total)}</b></p>
            <p class="qr-note" id="payment-note"></p>
          </section>

          <section class="receipt-card">
            <h2><i data-lucide="receipt-text"></i> Struk Pembelian</h2>
            <div class="receipt-body">
              <div class="receipt-head">
                <span class="brand-mark" style="width:44px;height:44px"></span>
                <div>
                  <b>${FawniaUtils.esc(settings.businessName)}</b>
                  <small>${FawniaUtils.esc(settings.address)}</small>
                  <small>${FawniaUtils.esc(settings.whatsapp)}</small>
                </div>
              </div>
              <table class="receipt-table">
                <thead><tr><th>Produk</th><th>Qty</th><th>Harga</th></tr></thead>
                <tbody>
                  ${(order.items || [{ name: order.productName, qty: 1, price: order.subtotal }]).map((i) => `
                    <tr><td>${FawniaUtils.esc(i.name)}</td><td>${i.qty}</td><td>${FawniaUtils.rupiah((Number(i.price) || 0) * (Number(i.qty) || 1))}</td></tr>`).join("")}
                </tbody>
              </table>
              <div class="receipt-totals">
                <div><span>Subtotal</span><span>${FawniaUtils.rupiah(order.subtotal)}</span></div>
                <div><span>Pengiriman — ${FawniaUtils.esc(FawniaStore.shippingLabel(order.shipping))}</span><span>${Number(order.shippingCost) === 0 ? "Gratis" : FawniaUtils.rupiah(order.shippingCost)}</span></div>
                <div class="grand"><span>Total</span><span>${FawniaUtils.rupiah(total)}</span></div>
              </div>
              <div class="receipt-info">
                <div><span>Pemesan</span><b>${FawniaUtils.esc(order.name)}</b></div>
                <div><span>WhatsApp</span><b>${FawniaUtils.esc(order.phone)}</b></div>
                <div><span>Alamat</span><b>${FawniaUtils.esc(order.address || "-")}</b></div>
                ${order.note ? `<div><span>Catatan</span><b>${FawniaUtils.esc(order.note)}</b></div>` : ""}
                <div><span>Nomor pesanan</span><b>${FawniaUtils.esc(order.id)}</b></div>
                <div><span>Tanggal</span><b>${FawniaUtils.tanggal(order.createdAt)}</b></div>
              </div>
              <p class="receipt-foot">Terima kasih sudah berbelanja di ${FawniaUtils.esc(settings.businessName)}!</p>
            </div>
            <div class="receipt-actions">
              <button type="button" class="btn btn-ghost" id="print-receipt"><i data-lucide="printer"></i> Cetak Struk</button>
              <a class="btn btn-primary" id="confirm-wa" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> Konfirmasi via WhatsApp</a>
            </div>
          </section>
        </div>
      </div>`;

    FawniaUI.mountLogos();

    /* QR DUMMY untuk demo — pola unik per pesanan.
       Untuk production, ganti dengan QRIS asli toko. */
    const qrImg = root.querySelector("#payment-qr");
    const note = root.querySelector("#payment-note");
    qrImg.src = FawniaQr.dataUrl(
      `${order.id}|${payment}|${total}`,
    );
    note.textContent = `QR demo — bukan QRIS asli. Bayar sesuai metode ${payment}, lalu kirim bukti + nomor pesanan ${order.id} ke WhatsApp admin.`;

    root.querySelector("#confirm-wa").href = FawniaUtils.waLink(
      settings.whatsapp,
      `Halo ${settings.businessName}, saya sudah membuat pesanan ${order.id} sebesar ${FawniaUtils.rupiah(total)}. Berikut bukti pembayarannya.`,
    );

    root.querySelector("#print-receipt").addEventListener("click", () => window.print());
    FawniaUI.icons();
  },
};

window.FawniaCheckout = FawniaCheckout;
document.addEventListener("DOMContentLoaded", () => FawniaCheckout.init("#checkout-page"));
