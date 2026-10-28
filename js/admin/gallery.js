/* ============================================================
   js/admin/gallery.js — CRUD galeri foto
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#gallery-admin-grid");
  if (!grid) return;

  const render = () => {
    const items = FawniaStore.getGallery();
    if (!items.length) {
      grid.innerHTML = `<div class="empty-state">Belum ada foto galeri.</div>`;
      return;
    }
    grid.innerHTML = items
      .map(
        (g) => `
      <article class="gallery-card">
        <div class="gallery-thumb">${FawniaUI.img(g.image, g.title)}</div>
        <div class="gallery-meta">
          <b>${FawniaUtils.esc(g.title)}</b>
          ${FawniaAdmin.badge(g.visible === false ? "Nonaktif" : "Aktif")}
        </div>
        <div class="gallery-actions">
          <button type="button" data-toggle="${FawniaUtils.esc(g.id)}">${g.visible === false ? "Tampilkan" : "Sembunyikan"}</button>
          <button type="button" data-edit="${FawniaUtils.esc(g.id)}">Edit</button>
          <button type="button" class="danger" data-delete="${FawniaUtils.esc(g.id)}">Hapus</button>
        </div>
      </article>`,
      )
      .join("");
  };

  const openForm = (item) => {
    FawniaAdmin.openModal({
      title: item ? "Edit Foto Galeri" : "Tambah Foto Galeri",
      body: `
        ${FawniaAdmin.field({ label: "Judul foto", name: "title", value: item?.title, required: true })}
        ${FawniaAdmin.field({ label: "Path gambar", name: "imagePath", value: item && !String(item.image).startsWith("data:") ? item.image : "", hint: "Contoh: assets/img/galeri-1.png" })}
        <label class="field">Upload foto (maks 2 MB)<input type="file" name="imageFile" accept="image/*"></label>
        <div class="preview-box">${item?.image ? FawniaUI.img(item.image, item.title) : "<span>Belum ada gambar</span>"}</div>`,
      onSubmit: async (modal) => {
        const f = modal.querySelector("#admin-modal-form");
        const title = f.querySelector('[name="title"]').value.trim();
        if (!title) throw new Error("Judul foto wajib diisi.");
        const uploaded = await FawniaAdmin.readImage(
          f.querySelector('[name="imageFile"]'),
          "",
        );
        const path = f.querySelector('[name="imagePath"]').value.trim();
        FawniaStore.saveGalleryItem({
          id: item?.id,
          title,
          image: uploaded || path || item?.image || FAWNIA_IMAGES.gallery[0],
          visible: item?.visible !== false,
        });
        render();
        FawniaUtils.toast("Galeri disimpan");
      },
    });
  };

  document
    .querySelector("#add-gallery")
    ?.addEventListener("click", () => openForm(null));

  grid.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-delete]");
    const toggleBtn = e.target.closest("[data-toggle]");
    if (editBtn)
      openForm(
        FawniaStore.getGallery().find(
          (g) => String(g.id) === editBtn.dataset.edit,
        ),
      );
    if (delBtn && FawniaAdmin.confirm("Hapus foto ini dari galeri?")) {
      FawniaStore.deleteGalleryItem(delBtn.dataset.delete);
      render();
      FawniaUtils.toast("Foto dihapus");
    }
    if (toggleBtn) {
      const item = FawniaStore.getGallery().find(
        (g) => String(g.id) === toggleBtn.dataset.toggle,
      );
      FawniaStore.saveGalleryItem({ ...item, visible: item.visible === false });
      render();
    }
  });

  render();
});
