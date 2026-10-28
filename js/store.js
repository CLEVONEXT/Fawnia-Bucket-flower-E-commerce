/* ============================================================
   js/store.js — Data layer (localStorage) untuk semua entitas
   ============================================================ */

const FawniaStore = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return structuredClone(fallback);
      const parsed = JSON.parse(raw);
      return parsed ?? structuredClone(fallback);
    } catch (e) {
      return structuredClone(fallback);
    }
  },
  _write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  _upsert(key, defaults, item) {
    const list = this._read(key, defaults);
    const copy = { ...item };
    if (copy.id) {
      const idx = list.findIndex((x) => String(x.id) === String(copy.id));
      if (idx > -1) list[idx] = { ...list[idx], ...copy };
      else list.push(copy);
    } else {
      copy.id = Date.now();
      list.push(copy);
    }
    this._write(key, list);
    return copy;
  },
  _remove(key, defaults, id) {
    this._write(
      key,
      this._read(key, defaults).filter((x) => String(x.id) !== String(id)),
    );
  },

  /* ---------- Pengaturan toko ---------- */
  getSettings() {
    return {
      ...FAWNIA_DEFAULTS.settings,
      ...this._read(FAWNIA_KEYS.settings, {}),
    };
  },
  saveSettings(settings) {
    this._write(FAWNIA_KEYS.settings, settings);
    return settings;
  },

  /* ---------- Produk ---------- */
  getProducts() {
    return this._read(FAWNIA_KEYS.products, FAWNIA_DEFAULTS.products);
  },
  getActiveProducts() {
    return this.getProducts().filter((p) => (p.status || "Aktif") === "Aktif");
  },
  getProduct(id) {
    return this.getProducts().find((p) => String(p.id) === String(id));
  },
  saveProduct(product) {
    return this._upsert(
      FAWNIA_KEYS.products,
      FAWNIA_DEFAULTS.products,
      product,
    );
  },
  deleteProduct(id) {
    this._remove(FAWNIA_KEYS.products, FAWNIA_DEFAULTS.products, id);
  },

  /* ---------- Galeri ---------- */
  getGallery() {
    return this._read(FAWNIA_KEYS.gallery, FAWNIA_DEFAULTS.gallery);
  },
  getVisibleGallery() {
    return this.getGallery().filter((g) => g.visible !== false);
  },
  saveGalleryItem(item) {
    return this._upsert(FAWNIA_KEYS.gallery, FAWNIA_DEFAULTS.gallery, item);
  },
  deleteGalleryItem(id) {
    this._remove(FAWNIA_KEYS.gallery, FAWNIA_DEFAULTS.gallery, id);
  },

  /* ---------- Testimoni ---------- */
  getTestimonials() {
    return this._read(FAWNIA_KEYS.testimonials, FAWNIA_DEFAULTS.testimonials);
  },
  getVisibleTestimonials() {
    return this.getTestimonials().filter((t) => t.visible !== false);
  },
  saveTestimonial(item) {
    return this._upsert(
      FAWNIA_KEYS.testimonials,
      FAWNIA_DEFAULTS.testimonials,
      item,
    );
  },
  deleteTestimonial(id) {
    this._remove(FAWNIA_KEYS.testimonials, FAWNIA_DEFAULTS.testimonials, id);
  },

  /* ---------- Pesanan ---------- */
  getOrders() {
    return this._read(FAWNIA_KEYS.orders, []);
  },
  addOrder(order) {
    const list = this.getOrders();
    const record = {
      ...order,
      id: "FWN-" + String(Date.now()).slice(-6),
      createdAt: new Date().toISOString(),
      status: "Baru",
    };
    list.unshift(record);
    this._write(FAWNIA_KEYS.orders, list);
    return record;
  },
  updateOrder(id, patch) {
    const list = this.getOrders();
    const idx = list.findIndex((o) => o.id === id);
    if (idx > -1) list[idx] = { ...list[idx], ...patch };
    this._write(FAWNIA_KEYS.orders, list);
  },
  deleteOrder(id) {
    this._remove(FAWNIA_KEYS.orders, [], id);
  },

  /* ---------- Helper pesanan ---------- */
  shippingLabel(id) {
    return (FAWNIA_SHIPPING.find((s) => s.id === id) || {}).label || id || "-";
  },
  shippingCost(id) {
    const s = FAWNIA_SHIPPING.find((x) => x.id === id);
    return s ? Number(s.cost) || 0 : 0;
  },
  paymentLabel(id) {
    return (FAWNIA_PAYMENTS.find((p) => p.id === id) || {}).label || id || "-";
  },
  orderTotal(order) {
    return Number(order.total || 0) + Number(order.shippingCost || 0);
  },
};

window.FawniaStore = FawniaStore;
