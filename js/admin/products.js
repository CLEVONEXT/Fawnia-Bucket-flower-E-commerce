/* ============================================================
   js/admin/products.js — CRUD produk (tambah, edit, hapus)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#product-list");
  if (!list) return;

  const render = () => {
    const products = FawniaStore.getProducts();
    if (!products.length) {
      list.innerHTML = `<div class="empty-state">Belum ada produk. Klik “Tambah Produk”.</div>`;
      return;
    }
    list.innerHTML = products
      .map(
        (p) => `
      <div class="table-row product-row">
        ${FawniaAdmin.thumb(p.image, p.name)}
        <div class="cell-main">
          <b>${FawniaUtils.esc(p.name)}</b>
          <small>${FawniaUtils.esc(p.label || "-")} · Stok ${Number(p.stock) || 0}</small>
        </div>
        <div class="cell-price">${FawniaUtils.rupiah(p.price)}</div>
        ${FawniaAdmin.badge(p.status || "Aktif")}
        <div class="row-actions">
          <button type="button" data-edit="${FawniaUtils.esc(p.id)}">Edit</button>
          <button type="button" class="danger" data-delete="${FawniaUtils.esc(p.id)}">Hapus</button>
        </div>
      </div>`,
      )
      .join("");
  };

  const formBody = (p = {}) => `
    ${FawniaAdmin.field({ label: "Nama produk", name: "name", value: p.name, required: true })}
    <div class="form-row">
      ${FawniaAdmin.field({ label: "Harga (Rp)", name: "price", type: "number", value: p.price ?? 0, required: true })}
      ${FawniaAdmin.field({ label: "Stok", name: "stock", type: "number", value: p.stock ?? 0, required: true })}
    </div>
    <div class="form-row">
      ${FawniaAdmin.field({ label: "Label", name: "label", value: p.label || "", hint: "Contoh: WISUDA, SWEET" })}
      ${FawniaAdmin.field({
        label: "Status",
        name: "status",
        type: "select",
        value: p.status || "Aktif",
        options: ["Aktif", "Nonaktif"],
      })}
    </div>
    ${FawniaAdmin.field({ label: "Deskripsi", name: "description", type: "textarea", value: p.description || "" })}
    ${FawniaAdmin.field({
      label: "Path gambar",
      name: "imagePath",
      value:
        typeof p.image === "string" && !p.image.startsWith("data:")
          ? p.image
          : "",
      hint: "Contoh: assets/img/bucket-1.png",
    })}
    <label class="field">Upload gambar (opsional, maks 2 MB)<input type="file" name="imageFile" accept="image/*"></label>
    <div class="preview-box">${p.image ? FawniaUI.img(p.image, p.name) : "<span>Belum ada gambar</span>"}</div>
    <p class="hint">Gambar akan disimpan sebagai data URL di localStorage.</p>`;

  const openForm = (product) => {
    FawniaAdmin.openModal({
      title: product ? "Edit Produk" : "Tambah Produk",
      body: formBody(product || {}),
      submitLabel: product ? "Simpan Perubahan" : "Tambah Produk",
      onSubmit: async (modal) => {
        const f = modal.querySelector("#admin-modal-form");
        const val = (n) => f.querySelector(`[name="${n}"]`).value.trim();
        const name = val("name");
        if (!name) throw new Error("Nama produk wajib diisi.");
        const imagePath = val("imagePath");
        const uploaded = await FawniaAdmin.readImage(
          f.querySelector('[name="imageFile"]'),
          "",
        );
        const image =
          uploaded || imagePath || product?.image || "assets/img/bucket-1.png";

        FawniaStore.saveProduct({
          id: product?.id,
          name,
          price: Number(val("price")) || 0,
          stock: Number(val("stock")) || 0,
          label: val("label") || name.slice(0, 8).toUpperCase(),
          status: val("status"),
          description: val("description"),
          image,
        });
        render();
        FawniaUtils.toast(product ? "Produk diperbarui" : "Produk ditambahkan");
      },
    });
  };

  document
    .querySelector("#add")
    ?.addEventListener("click", () => openForm(null));

  list.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-delete]");
    if (editBtn) openForm(FawniaStore.getProduct(editBtn.dataset.edit));
    if (delBtn && FawniaAdmin.confirm("Hapus produk ini?")) {
      FawniaStore.deleteProduct(delBtn.dataset.delete);
      render();
      FawniaUtils.toast("Produk dihapus");
    }
  });

  render();
});
