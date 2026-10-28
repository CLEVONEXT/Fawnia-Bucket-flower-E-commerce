/* ============================================================
   js/admin/sidebar.js — Render header + sidebar panel admin
   Menu aktif ditentukan dari nama file halaman.
   ============================================================ */

const FAWNIA_ADMIN_MENU = [
  { file: "dashboard.html", icon: "layout-dashboard", label: "Dashboard" },
  { file: "products.html", icon: "package", label: "Produk" },
  { file: "gallery.html", icon: "image", label: "Galeri" },
  { file: "testimonials.html", icon: "star", label: "Testimoni" },
  { file: "orders.html", icon: "clipboard-list", label: "Pesanan" },
  { file: "messages.html", icon: "mail", label: "Pesan" },
  { file: "settings.html", icon: "settings", label: "Pengaturan" },
];

const FawniaAdminLayout = {
  mount() {
    const current = location.pathname.split("/").pop() || "dashboard.html";

    const header = document.querySelector(".admin-top");
    if (header && !header.dataset.built) {
      header.dataset.built = "true";
      header.innerHTML = `
        <a class="admin-brand brand" href="../../index.html">
          <span class="brand-mark" aria-hidden="true">F</span>
          <span class="admin-brand-name">Fawnia<small>ADMIN</small></span>
        </a>
        <div class="admin-top-actions">
          <a class="top-link" href="../../index.html" target="_blank" rel="noopener">Lihat Website</a>
          <button id="logout" class="logout" type="button">Logout</button>
        </div>`;
      FawniaUI.mountLogos();
      document
        .querySelector("#logout")
        ?.addEventListener("click", () => FawniaAuth.logout());
    }

    const sidebar = document.querySelector(".admin-sidebar");
    if (sidebar && !sidebar.dataset.built) {
      sidebar.dataset.built = "true";
      sidebar.innerHTML = FAWNIA_ADMIN_MENU.map(
        (
          m,
        ) => `<a class="${m.file === current ? "active" : ""}" href="${m.file}">
          <i data-lucide="${m.icon}"></i><span>${m.label}</span>
        </a>`,
      ).join("");
    }

    FawniaUI.icons();
  },
};

window.FawniaAdminLayout = FawniaAdminLayout;
document.addEventListener("DOMContentLoaded", () => FawniaAdminLayout.mount());
