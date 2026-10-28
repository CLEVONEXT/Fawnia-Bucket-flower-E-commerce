/* ============================================================
   js/admin/common.js — Helper khusus panel admin
   (modal, konfirmasi, upload gambar, field builder)
   ============================================================ */

const FawniaAdmin = {
  /* ---------- Modal ---------- */
  openModal({ title, body, onSubmit, submitLabel = "Simpan" }) {
    this.closeModal();
    const wrap = document.createElement("div");
    wrap.id = "admin-modal";
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${FawniaUtils.esc(title)}">
        <header class="modal-head">
          <h2>${FawniaUtils.esc(title)}</h2>
          <button type="button" class="modal-close" aria-label="Tutup">&times;</button>
        </header>
        <form class="modal-body" id="admin-modal-form">
          ${body}
          <p class="error" id="admin-modal-error"></p>
          <footer class="modal-foot">
            <button type="button" class="btn-secondary" data-close>Batal</button>
            <button type="submit" class="admin-btn">${FawniaUtils.esc(submitLabel)}</button>
          </footer>
        </form>
      </div>`;
    document.body.appendChild(wrap);
    document.body.style.overflow = "hidden";

    const close = () => this.closeModal();
    wrap.querySelector(".modal-close").addEventListener("click", close);
    wrap.querySelector("[data-close]").addEventListener("click", close);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close();
    });
    wrap
      .querySelector("#admin-modal-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const error = wrap.querySelector("#admin-modal-error");
        try {
          const result = await onSubmit(wrap);
          if (result === false) return;
          this.closeModal();
        } catch (err) {
          error.textContent = err.message || "Terjadi kesalahan.";
        }
      });
    wrap.querySelector("input,select,textarea")?.focus();
    return wrap;
  },

  closeModal() {
    document.querySelector("#admin-modal")?.remove();
    document.body.style.overflow = "";
  },

  confirm(message) {
    return window.confirm(message);
  },

  /* ---------- Field builder ---------- */
  field({
    label,
    name,
    type = "text",
    value = "",
    required = false,
    options,
    rows = 3,
    hint,
    accept,
  }) {
    const v = FawniaUtils.esc(value);
    let control = "";
    if (type === "textarea") {
      control = `<textarea name="${name}" rows="${rows}" ${required ? "required" : ""}>${v}</textarea>`;
    } else if (type === "select") {
      control = `<select name="${name}" ${required ? "required" : ""}>${(
        options || []
      )
        .map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return `<option value="${FawniaUtils.esc(opt.value)}" ${String(opt.value) === String(value) ? "selected" : ""}>${FawniaUtils.esc(opt.label)}</option>`;
        })
        .join("")}</select>`;
    } else if (type === "checkbox") {
      return `<label class="check-line"><input type="checkbox" name="${name}" ${value ? "checked" : ""}> ${FawniaUtils.esc(label)}</label>`;
    } else {
      control = `<input name="${name}" type="${type}" value="${v}" ${required ? "required" : ""} ${
        accept ? `accept="${accept}"` : ""
      } ${type === "number" ? 'min="0"' : ""}>`;
    }
    return `<label class="field">${FawniaUtils.esc(label)}${required ? " *" : ""}${control}${
      hint ? `<small>${FawniaUtils.esc(hint)}</small>` : ""
    }</label>`;
  },

  /* Upload gambar -> kembalikan data URL, atau pertahankan path lama */
  async readImage(fileInput, fallback = "") {
    const file = fileInput?.files?.[0];
    if (!file) return fallback;
    if (!file.type.startsWith("image/"))
      throw new Error("File harus berupa gambar.");
    if (file.size > 2 * 1024 * 1024)
      throw new Error("Ukuran gambar maksimal 2 MB.");
    return FawniaUtils.fileToDataURL(file);
  },

  thumb(src, alt = "") {
    return `<span class="thumb">${FawniaUI.img(src, alt)}</span>`;
  },

  badge(text) {
    const key = String(text).toLowerCase();
    return `<span class="status status-${key.replace(/\s+/g, "-")}">${FawniaUtils.esc(text)}</span>`;
  },
};

window.FawniaAdmin = FawniaAdmin;
