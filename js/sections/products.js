/* ============================================================
   js/sections/products.js — Grid produk bergaya marketplace
   (ala Shopee/Lazada: kartu dua baris, harga, terjual, tombol keranjang)
   ============================================================ */

const FawniaProductsSection = {
  render(query = "") {
    const grid = document.querySelector("#product-grid");
    if (!grid) return;
    const q = query.trim().toLowerCase();
    const all = FawniaStore.getActiveProducts();
    const items = q
      ? all.filter((p) =>
          `${p.name} ${p.description} ${p.label}`.toLowerCase().includes(q),
        )
      : all;

    const resultCount = document.querySelector("#product-result");
    if (resultCount) {
      resultCount.textContent = q
        ? `${items.length} produk ditemukan untuk “${query.trim()}”`
        : "";
    }

    if (!items.length) {
      grid.innerHTML = `<div class="empty-state"><p>Tidak ada produk yang cocok dengan pencarianmu.</p></div>`;
      return;
    }

    grid.innerHTML = items
      .map((p) => {
        const detailUrl = `pages/product-detail.html?id=${encodeURIComponent(p.id)}`;
        return `
      <article class="product-card">
        <a href="${detailUrl}" class="product-image" aria-label="Detail ${FawniaUtils.esc(p.name)}">
          ${FawniaUI.img(p.image, p.name, "product-img")}
          <span class="product-label">${FawniaUtils.esc(p.label || "FAWNIA")}</span>
          ${Number(p.stock) <= 5 ? `<span class="product-flash">Stok terbatas</span>` : ""}
        </a>
        <div class="product-info">
          <h3 class="product-name">${FawniaUtils.esc(p.name)}</h3>
          <div class="product-price-row">
            <span class="price">${FawniaUtils.rupiah(p.price)}</span>
          </div>
          <div class="product-meta">
            ${Number(p.stock) > 0 ? "" : `<span class="dot">·</span><span class="oos">Stok habis</span>`}
          </div>
          <div class="product-actions">
            <button type="button" class="cart-btn" data-add-to-cart="${FawniaUtils.esc(p.id)}" ${Number(p.stock) === 0 ? "disabled" : ""}>
              <i data-lucide="shopping-cart"></i> + Keranjang
            </button>
          </div>
        </div>
      </article>`;
      })
      .join("");
    FawniaUI.icons();
  },

  init() {
    this.render();
    const input = document.querySelector("#search-input");
    const form = document.querySelector("#search-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.render(input?.value || "");
        document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
      });
    }
    input?.addEventListener("input", () => this.render(input.value));

    document.addEventListener("fawnia:cart-changed", () => this.render(input?.value || ""));
  },
};

window.FawniaProductsSection = FawniaProductsSection;
