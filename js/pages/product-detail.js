/* ============================================================
   js/pages/product-detail.js — Halaman detail produk
   Gaya marketplace: qty stepper, add to cart, beli langsung.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const settings = FawniaStore.getSettings();
  const products = FawniaStore.getActiveProducts();
  const id = FawniaUtils.getParam("id");
  const product = FawniaStore.getProduct(id) || products[0];

  FawniaUI.mountLogos();
  document.querySelectorAll("[data-wa-link]").forEach((a) => {
    a.href = FawniaUtils.waLink(settings.whatsapp, `Halo ${settings.businessName}, saya ingin bertanya.`);
  });

  const root = document.querySelector("#detail");
  if (!root) return;

  if (!product) {
    root.innerHTML = `<p class="empty-note">Produk tidak ditemukan. <a href="../index.html#products">Kembali ke katalog</a></p>`;
    return;
  }

  document.title = `${product.name} — Fawnia Shop`;
  const outOfStock = Number(product.stock) === 0;
  const related = products.filter((p) => String(p.id) !== String(product.id)).slice(0, 4);

  root.innerHTML = `
    <nav class="breadcrumbs">
      <a href="../index.html">Home</a> <span>›</span>
      <a href="../index.html#products">Produk</a> <span>›</span>
      <b>${FawniaUtils.esc(product.name)}</b>
    </nav>

    <div class="detail-grid">
      <div class="detail-media">
        ${FawniaUI.img(product.image, product.name, "", "width:100%;height:100%;object-fit:cover")}
      </div>
      <div class="detail-body">
        <p class="eyebrow">${FawniaUtils.esc(product.label || "FAWNIA")}</p>
        <h1>${FawniaUtils.esc(product.name)}</h1>
        <div class="detail-meta">
          <span class="pill">★ 5.0</span>
          <span class="pill">Stok: ${Number(product.stock) || 0}</span>
          ${outOfStock ? `<span class="pill oos">Stok habis</span>` : `<span class="pill ok">Tersedia</span>`}
        </div>
        <p class="detail-desc">${FawniaUtils.esc(product.description)}</p>
        <div class="detail-price">${FawniaUtils.rupiah(product.price)}</div>

        <div class="buy-row">
          <div class="qty-stepper lg">
            <button type="button" id="qty-dec" ${""}>&minus;</button>
            <span id="qty-value">1</span>
            <button type="button" id="qty-inc">+</button>
          </div>
          <button type="button" class="cart-btn lg" id="add-cart" data-add-to-cart="${FawniaUtils.esc(product.id)}" ${outOfStock ? "disabled" : ""}>
            <i data-lucide="shopping-cart"></i> Masukkan Keranjang
          </button>
          <button type="button" class="btn btn-primary lg" id="buy-now" ${outOfStock ? "disabled" : ""}>
            <i data-lucide="zap"></i> Beli Sekarang
          </button>
        </div>

        <a class="wa-inline" target="_blank" rel="noopener"
           href="${FawniaUtils.waLink(settings.whatsapp, `Halo ${settings.businessName}, saya ingin memesan ${product.name} (${FawniaUtils.rupiah(product.price)}). Apakah masih tersedia?`)}">
          <i data-lucide="message-circle"></i> Tanya admin via WhatsApp
        </a>

        <ul class="detail-points">
          <li><i data-lucide="truck"></i> Pengiriman: ambil di toko, kurir lokal, instant, JNE, J&amp;T, SiCepat.</li>
          <li><i data-lucide="credit-card"></i> Pembayaran: transfer, QRIS, GoPay, ShopeePay, DANA, COD.</li>
          <li><i data-lucide="package"></i> Packing aman — dus tebal + bubble wrap.</li>
          <li><i data-lucide="sparkles"></i> Bisa request warna, tema, dan kartu ucapan.</li>
        </ul>
        <a class="text-link" style="margin-top:20px" href="../index.html#products"><i data-lucide="arrow-left"></i> Kembali ke katalog</a>
      </div>
    </div>

    ${
      related.length
        ? `<div class="detail-section">
            <div class="section-head"><div><p class="eyebrow">PRODUK LAIN</p><h2>Mungkin kamu suka</h2></div></div>
            <div class="product-grid">
              ${related
                .map(
                  (p) => `
                <article class="product-card">
                  <a href="product-detail.html?id=${encodeURIComponent(p.id)}" class="product-image">
                    ${FawniaUI.img(p.image, p.name, "product-img")}
                    <span class="product-label">${FawniaUtils.esc(p.label || "FAWNIA")}</span>
                  </a>
                  <div class="product-info">
                    <h3 class="product-name">${FawniaUtils.esc(p.name)}</h3>
                    <div class="product-price-row"><span class="price">${FawniaUtils.rupiah(p.price)}</span></div>
                    <div class="product-actions">
                      <button type="button" class="cart-btn" data-add-to-cart="${FawniaUtils.esc(p.id)}">
                        <i data-lucide="shopping-cart"></i> + Keranjang
                      </button>
                    </div>
                  </div>
                </article>`,
                )
                .join("")}
            </div>
          </div>`
        : ""
    }`;

  /* Stepper jumlah */
  let qty = 1;
  const qtyValue = root.querySelector("#qty-value");
  root.querySelector("#qty-inc")?.addEventListener("click", () => {
    qty = Math.min(99, qty + 1);
    qtyValue.textContent = qty;
  });
  root.querySelector("#qty-dec")?.addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValue.textContent = qty;
  });

  /* Masukkan keranjang memakai jumlah stepper */
  const addBtn = root.querySelector("#add-cart");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addBtn.dataset.qty = qty;
      FawniaCart.add(product.id, qty);
      FawniaUtils.toast(`${qty}x ${product.name} masuk keranjang`);
      addBtn.classList.add("added");
      setTimeout(() => addBtn.classList.remove("added"), 900);
      FawniaCart.updateBadge();
      FawniaCart.renderItems();
    });
  }

  /* Beli sekarang: masukkan keranjang lalu ke halaman checkout */
  root.querySelector("#buy-now")?.addEventListener("click", () => {
    FawniaCart.add(product.id, qty);
    FawniaCart.updateBadge();
    location.href = "checkout.html";
  });

  FawniaUI.initLightbox();
  FawniaUI.icons();
});
