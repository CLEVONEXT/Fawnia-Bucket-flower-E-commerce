/* ============================================================
   js/cart.js — Keranjang belanja (localStorage) + tampilan drawer
   Dimuat di semua halaman publik. Tetap berjalan aman
   walaupun urutan pemuatan skrip berbeda.
   ============================================================ */

const FawniaCart = {
  KEY: "fawnia_cart",

  /* ---------- Penyimpanan ---------- */
  _read() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  _write(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateBadge();
    document.dispatchEvent(new CustomEvent("fawnia:cart-changed"));
  },

  /* ---------- Operasi item ---------- */
  items() {
    return this._read();
  },
  count() {
    return this.items().reduce((n, i) => n + (Number(i.qty) || 0), 0);
  },
  subtotal() {
    return this.items().reduce(
      (n, i) => n + (Number(i.price) || 0) * (Number(i.qty) || 0),
      0,
    );
  },

  add(productId, qty = 1) {
    const product = FawniaStore.getProduct(productId);
    if (!product) return null;
    const items = this._read();
    const existing = items.find((i) => String(i.id) === String(productId));
    if (existing) {
      existing.qty = Math.min(99, (Number(existing.qty) || 0) + (Number(qty) || 1));
    } else {
      items.unshift({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image || "",
        label: product.label || "",
        qty: Math.max(1, Number(qty) || 1),
      });
    }
    this._write(items);
    return product;
  },

  setQty(productId, qty) {
    const items = this._read();
    const item = items.find((i) => String(i.id) === String(productId));
    if (!item) return;
    const q = Math.max(1, Math.min(99, Number(qty) || 1));
    if (q === item.qty) return;
    item.qty = q;
    this._write(items);
  },

  remove(productId) {
    this._write(this._read().filter((i) => String(i.id) !== String(productId)));
  },

  clear() {
    this._write([]);
  },

  updateBadge() {
    const n = this.count();
    document.querySelectorAll("[data-cart-count]").forEach((b) => {
      b.textContent = n > 99 ? "99+" : n;
      b.style.display = n > 0 ? "grid" : "none";
    });
  },

  /* ---------- Drawer keranjang ---------- */
  ensureDrawer() {
    let root =
      document.querySelector("#cart-drawer") ||
      document.querySelector("#fawnia-cart-drawer");
    if (root?.querySelector(".drawer")) return;

    if (!root) {
      root = document.createElement("div");
      document.body.appendChild(root);
    }
    root.id = "cart-drawer";
    root.className = "cart-drawer-root";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="drawer-backdrop" data-cart-close></div>
      <aside class="drawer" role="dialog" aria-label="Keranjang belanja">
        <header class="drawer-head">
          <h2><i data-lucide="shopping-cart"></i> Keranjang</h2>
          <button type="button" class="drawer-close" data-cart-close aria-label="Tutup">&times;</button>
        </header>
        <div class="drawer-items" id="cart-items"></div>
        <footer class="drawer-foot">
          <div class="drawer-subtotal">
            <span>Subtotal</span>
            <strong id="cart-subtotal">${FawniaUtils.rupiah(this.subtotal())}</strong>
          </div>
          <a class="btn btn-primary" href="${this.pageBase()}pages/checkout.html" data-cart-go-checkout>Lanjut ke Checkout</a>
          <button type="button" class="drawer-clear" data-cart-clear>Kosongkan keranjang</button>
        </footer>
      </aside>`;
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-cart-close]")) this.close();
      if (e.target.closest("[data-cart-go-checkout]")) this.close();
      if (e.target.closest("[data-cart-clear]")) {
        if (confirm("Kosongkan keranjang?")) {
          this.clear();
          this.renderItems();
        }
        return;
      }
      const inc = e.target.closest("[data-inc]");
      const dec = e.target.closest("[data-dec]");
      const del = e.target.closest("[data-del]");
      if (inc) this.setQty(inc.dataset.inc, Number(inc.dataset.qty) + 1);
      if (dec) this.setQty(dec.dataset.dec, Number(dec.dataset.qty) - 1);
      if (del) {
        this.remove(del.dataset.del);
        FawniaUtils.toast("Produk dihapus dari keranjang");
      }
      if (inc || dec || del) this.renderItems();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  },

  /* Awalan path untuk halaman di subfolder (data-base pada <html>) */
  pageBase() {
    return document.documentElement.dataset.base || "";
  },

  open() {
    this.ensureDrawer();
    this.renderItems();
    const root = document.querySelector("#cart-drawer");
    root.classList.add("show");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    /* Beri tahu Lenis untuk berhenti menggulir selama drawer terbuka. */
    document.dispatchEvent(new CustomEvent("fawnia:scroll-lock", { detail: { locked: true } }));
  },

  close() {
    const root = document.querySelector("#cart-drawer");
    if (!root) return;
    root.classList.remove("show");
    root.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.dispatchEvent(new CustomEvent("fawnia:scroll-lock", { detail: { locked: false } }));
  },

  /* Ubah tombol "+ Keranjang" menjadi "Lihat Keranjang" sesaat,
     pengganti membuka drawer otomatis. */
  markButton(btn) {
    btn.classList.add("added");
    const original = btn.dataset.label || btn.textContent.trim();
    btn.dataset.label = original;
    btn.textContent = "Lihat Keranjang";
    clearTimeout(btn._resetTimer);
    btn._resetTimer = setTimeout(() => {
      btn.textContent = btn.dataset.label || "+ Keranjang";
      btn.classList.remove("added");
    }, 1400);
  },

  isOpen() {
    return document.querySelector("#cart-drawer")?.classList.contains("show");
  },

  renderItems() {
    const box = document.querySelector("#cart-items");
    if (!box) return;
    const items = this.items();
    const subtotalEl = document.querySelector("#cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = FawniaUtils.rupiah(this.subtotal());

    if (!items.length) {
      box.innerHTML = `<div class="drawer-empty"><i data-lucide="shopping-cart"></i><p>Keranjang masih kosong.</p><small>Yuk, pilih bucket favoritmu!</small></div>`;
      FawniaUI.icons();
      return;
    }

    box.innerHTML = items
      .map(
        (i) => `
      <div class="cart-item">
        <span class="cart-thumb">${FawniaUI.img(i.image, i.name)}</span>
        <div class="cart-info">
          <b>${FawniaUtils.esc(i.name)}</b>
          <span class="cart-price">${FawniaUtils.rupiah(i.price)}</span>
          <div class="qty-stepper">
            <button type="button" data-dec="${FawniaUtils.esc(i.id)}" data-qty="${i.qty}" ${i.qty <= 1 ? "disabled" : ""}>&minus;</button>
            <span>${i.qty}</span>
            <button type="button" data-inc="${FawniaUtils.esc(i.id)}" data-qty="${i.qty}">+</button>
            <button type="button" class="cart-del" data-del="${FawniaUtils.esc(i.id)}" aria-label="Hapus"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <strong class="cart-line-total">${FawniaUtils.rupiah(i.price * i.qty)}</strong>
      </div>`,
      )
      .join("");
    FawniaUI.icons();
  },

  /* ---------- Inisialisasi global ---------- */
  init() {
    const start = () => {
      this.ensureDrawer();
      this.updateBadge();
      this.renderItems();

      /* Delegasi klik global — berlaku untuk semua halaman */
      document.addEventListener("click", (e) => {
        const opener = e.target.closest("[data-cart-open]");
        if (opener) {
          e.preventDefault();
          this.open();
          return;
        }
        const btn = e.target.closest("[data-add-to-cart]");
        if (btn && !btn.disabled) {
          e.preventDefault();
          const product = this.add(btn.dataset.addToCart, Number(btn.dataset.qty) || 1);
          if (product) {
            FawniaUtils.toast(`${product.name} masuk keranjang`);
            btn.classList.add("added");
            setTimeout(() => btn.classList.remove("added"), 900);
            this.renderItems();
            this.updateBadge();
            /* Tidak membuka drawer otomatis: cukup ubah tombol menjadi
               "Lihat Keranjang" agar belanja tidak terhenti. */
            this.markButton(btn);
          }
        }
      });

      window.addEventListener("storage", (e) => {
        if (e.key === this.KEY) {
          this.renderItems();
          this.updateBadge();
        }
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => start());
    } else {
      start();
    }
  },
};

FawniaCart.init();
window.FawniaCart = FawniaCart;
