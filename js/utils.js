/* ============================================================
   js/utils.js — Fungsi bantu (format, escape, validasi)
   ============================================================ */

const FawniaUtils = {
  rupiah(n) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);
  },

  /* Ganti karakter berbahaya agar aman ditaruh ke innerHTML / atribut */
  esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  tanggal(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /* Nomor WA: buang spasi, +, tanda hubung, awalan 0 -> 62 */
  waNumber(raw) {
    let n = String(raw || "").replace(/[^\d]/g, "");
    if (n.startsWith("0")) n = "62" + n.slice(1);
    return n;
  },

  waLink(number, message) {
    const n = this.waNumber(number);
    return `https://wa.me/${n}?text=${encodeURIComponent(message || "")}`;
  },

  getParam(name) {
    return new URLSearchParams(location.search).get(name);
  },

  stars(rating) {
    const r = Math.max(1, Math.min(5, Number(rating) || 5));
    return "★".repeat(r) + "☆".repeat(5 - r);
  },

  /* Baca file gambar sebagai data URL (untuk upload dari admin) */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },

  toast(message) {
    let el = document.querySelector("#app-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "app-toast";
      el.className = "app-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 3200);
  },

  mountBackButton() {
    if (location.pathname === "/" || location.pathname.endsWith("/index.html")) return;

    const header = document.querySelector(".site-header .header-inner, .admin-top, .login-card");
    if (!header || header.querySelector("[data-page-back]")) return;
    if (header.matches(".admin-top") && !header.querySelector(".admin-brand")) return;

    const base = document.documentElement.dataset.base || "../";
    const back = document.createElement("a");
    back.className = "page-back";
    back.href = `${base}index.html`;
    back.title = "Kembali";
    back.setAttribute("aria-label", "Kembali");
    back.dataset.pageBack = "";
    back.innerHTML = '<i data-lucide="arrow-left"></i>';
    back.addEventListener("click", (event) => {
      if (!document.referrer || history.length < 2) return;
      try {
        if (new URL(document.referrer).origin === location.origin) {
          event.preventDefault();
          history.back();
        }
      } catch {
        // Keep the Home link as a fallback for an invalid referrer.
      }
    });
    header.prepend(back);
    FawniaUI?.icons();
  },
};

window.FawniaUtils = FawniaUtils;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(() => FawniaUtils.mountBackButton(), 0), { once: true });
} else {
  FawniaUtils.mountBackButton();
}
