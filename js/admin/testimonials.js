/* ============================================================
   js/admin/testimonials.js — CRUD testimoni pelanggan
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#testimonial-list");
  if (!list) return;

  const render = () => {
    const items = FawniaStore.getTestimonials();
    if (!items.length) {
      list.innerHTML = `<div class="empty-state">Belum ada testimoni.</div>`;
      return;
    }
    list.innerHTML = items
      .map(
        (t) => `
      <div class="table-row testimonial-row">
        <div class="cell-main">
          <b>${FawniaUtils.esc(t.name)}</b>
          <small class="stars">${FawniaUtils.stars(t.rating)}</small>
          <p class="quote">“${FawniaUtils.esc(t.text)}”</p>
        </div>
        ${FawniaAdmin.badge(t.visible === false ? "Nonaktif" : "Aktif")}
        <div class="row-actions">
          <button type="button" data-toggle="${FawniaUtils.esc(t.id)}">${t.visible === false ? "Tampilkan" : "Sembunyikan"}</button>
          <button type="button" data-edit="${FawniaUtils.esc(t.id)}">Edit</button>
          <button type="button" class="danger" data-delete="${FawniaUtils.esc(t.id)}">Hapus</button>
        </div>
      </div>`,
      )
      .join("");
  };

  const openForm = (item) => {
    FawniaAdmin.openModal({
      title: item ? "Edit Testimoni" : "Tambah Testimoni",
      body: `
        ${FawniaAdmin.field({ label: "Nama pelanggan", name: "name", value: item?.name, required: true })}
        ${FawniaAdmin.field({
          label: "Rating",
          name: "rating",
          type: "select",
          value: item?.rating ?? 5,
          options: [5, 4, 3, 2, 1].map((n) => ({
            value: n,
            label: `${n} bintang`,
          })),
        })}
        ${FawniaAdmin.field({ label: "Isi testimoni", name: "text", type: "textarea", value: item?.text, required: true })}`,
      onSubmit: (modal) => {
        const f = modal.querySelector("#admin-modal-form");
        const name = f.querySelector('[name="name"]').value.trim();
        const text = f.querySelector('[name="text"]').value.trim();
        if (!name || !text)
          throw new Error("Nama dan isi testimoni wajib diisi.");
        FawniaStore.saveTestimonial({
          id: item?.id,
          name,
          text,
          rating: Number(f.querySelector('[name="rating"]').value),
          visible: item?.visible !== false,
        });
        render();
        FawniaUtils.toast("Testimoni disimpan");
      },
    });
  };

  document
    .querySelector("#add-testimonial")
    ?.addEventListener("click", () => openForm(null));

  list.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-delete]");
    const toggleBtn = e.target.closest("[data-toggle]");
    if (editBtn)
      openForm(
        FawniaStore.getTestimonials().find(
          (t) => String(t.id) === editBtn.dataset.edit,
        ),
      );
    if (delBtn && FawniaAdmin.confirm("Hapus testimoni ini?")) {
      FawniaStore.deleteTestimonial(delBtn.dataset.delete);
      render();
      FawniaUtils.toast("Testimoni dihapus");
    }
    if (toggleBtn) {
      const item = FawniaStore.getTestimonials().find(
        (t) => String(t.id) === toggleBtn.dataset.toggle,
      );
      FawniaStore.saveTestimonial({ ...item, visible: item.visible === false });
      render();
    }
  });

  render();
});
