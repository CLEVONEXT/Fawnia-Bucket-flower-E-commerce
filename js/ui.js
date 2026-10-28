/* ============================================================
   js/ui.js — Komponen UI umum (logo, fallback gambar, lightbox)
   ============================================================ */

const FawniaUI = {
  /* Pasang logo ke semua elemen .brand-mark.
     File: assets/img/fawnia-logo.png — jika belum ada, tampil huruf "F". */
  mountLogos() {
    const name = FawniaStore.getSettings().businessName;
    /* Halaman di subfolder (pages/admin) set data-base="../../" di <html> */
    const base = this.base();
    document.querySelectorAll(".brand-mark").forEach((el) => {
      if (el.querySelector("img")) return;
      el.textContent = "";
      const img = document.createElement("img");
      img.src = base + FAWNIA_IMAGES.logo;
      img.alt = `Logo ${name}`;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%";
      img.onerror = () => {
        el.textContent = "F";
      };
      el.appendChild(img);
    });
  },

  /* Prefix path relatif untuk halaman di subfolder (data-base di <html>) */
  base() {
    return document.documentElement.dataset.base || "";
  },

  /* Gambar dengan fallback placeholder jika file PNG belum tersedia */
  img(src, alt, className = "", style = "") {
    let path = src || "";
    if (path && !path.startsWith("data:") && !/^https?:/i.test(path) && !path.startsWith(this.base())) {
      path = this.base() + path.replace(/^\.\//, "");
    }
    const safeSrc = FawniaUtils.esc(path);
    const safeAlt = FawniaUtils.esc(alt || "");
    return `<img src="${safeSrc}" alt="${safeAlt}" class="${className}" style="${style}" loading="lazy"
      onerror="this.onerror=null;this.src='${FawniaImages.placeholderSvg(safeAlt)}'">`;
  },

  /* Inisialisasi icon lucide (jika library tersedia) */
  icons() {
    if (window.lucide) window.lucide.createIcons();
  },

  /* ---------- Modal ringan untuk halaman publik ---------- */
  openModal({ title, body, submitLabel = "Tutup", onSubmit }) {
    this.closeModal();
    const wrap = document.createElement("div");
    wrap.id = "public-modal";
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${FawniaUtils.esc(title)}">
        <header class="modal-head">
          <h2>${FawniaUtils.esc(title)}</h2>
          <button type="button" class="modal-close" aria-label="Tutup">&times;</button>
        </header>
        <form class="modal-body" id="public-modal-form">
          ${body}
          <footer class="modal-foot">
            ${submitLabel === "Tutup" ? "" : `<button type="button" class="btn btn-ghost" data-close>Batal</button>`}
            <button type="submit" class="btn btn-primary">${FawniaUtils.esc(submitLabel)}</button>
          </footer>
        </form>
      </div>`;
    document.body.appendChild(wrap);
    document.body.style.overflow = "hidden";

    const close = () => this.closeModal();
    wrap.querySelector(".modal-close").addEventListener("click", close);
    wrap.querySelector("[data-close]")?.addEventListener("click", close);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close();
    });
    wrap.querySelector("#public-modal-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const result = await onSubmit(wrap);
        if (result === false) return;
        close();
      } catch (err) {
        const errBox = wrap.querySelector(".modal-body .error") || wrap.querySelector(".modal-body");
        errBox.insertAdjacentHTML("beforeend", `<p class="error">${FawniaUtils.esc(err.message)}</p>`);
      }
    });
    FawniaUI.icons();
    return wrap;
  },

  field({ label, name, type = "text", value = "", required = false, options, rows = 3 }) {
    const safeName = FawniaUtils.esc(name);
    const safeLabel = FawniaUtils.esc(label);
    const safeValue = FawniaUtils.esc(value);
    let control = "";

    if (type === "textarea") {
      control = `<textarea name="${safeName}" rows="${rows}" ${required ? "required" : ""}>${safeValue}</textarea>`;
    } else if (type === "select") {
      control = `<select name="${safeName}" ${required ? "required" : ""}>${(options || [])
        .map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return `<option value="${FawniaUtils.esc(item.value)}" ${String(item.value) === String(value) ? "selected" : ""}>${FawniaUtils.esc(item.label)}</option>`;
        })
        .join("")}</select>`;
    } else {
      control = `<input name="${safeName}" type="${FawniaUtils.esc(type)}" value="${safeValue}" ${required ? "required" : ""}>`;
    }

    return `<label class="field">${safeLabel}${required ? " *" : ""}${control}</label>`;
  },

  closeModal() {
    document.querySelector("#public-modal")?.remove();
    document.body.style.overflow = "";
  },

  /* Lightbox global */
  initLightbox() {
    const box = document.querySelector("#lightbox");
    if (!box) return;
    const close = () => {
      box.classList.remove("show");
      box.setAttribute("aria-hidden", "true");
    };
    document.querySelector("#close-lightbox")?.addEventListener("click", close);
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    this._closeLightbox = close;
  },
  openLightbox(src, title) {
    const box = document.querySelector("#lightbox");
    const image = document.querySelector("#lightbox-img");
    if (!box || !image) return;
    image.src = src;
    image.alt = title || "";
    box.classList.add("show");
    box.setAttribute("aria-hidden", "false");
  },
  closeLightbox() {
    this._closeLightbox?.();
  },
};

/* Placeholder SVG untuk gambar yang belum tersedia */
const FawniaImages = {
  placeholderSvg(label = "") {
    const text = String(label)
      .slice(0, 22)
      .replace(/[<>&"]/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600">
      <rect width="480" height="600" fill="#e6d5c9"/>
      <rect x="24" y="24" width="432" height="552" fill="none" stroke="#cbb3a2" stroke-width="3" stroke-dasharray="14 12"/>
      <text x="240" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#a28774">FAWNIA</text>
      <text x="240" y="336" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" fill="#b09a89">${text}</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  },
};

window.FawniaUI = FawniaUI;
window.FawniaImages = FawniaImages;
