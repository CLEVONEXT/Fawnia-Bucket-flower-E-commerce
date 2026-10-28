/* ============================================================
   js/admin/auth.js — Login demo + proteksi halaman admin
   GANTI dengan backend authentication untuk production.
   ============================================================ */

const FAWNIA_ADMIN_DEMO = {
  email: "admin@fawnia.com",
  password: "Fawnia123!",
};
const FAWNIA_ADMIN_LOGIN_URL = "/pages/admin/login.html";
const FAWNIA_ADMIN_DASHBOARD_URL = "/pages/admin/dashboard.html";

const FawniaAuth = {
  isLoginPage() {
    const path = location.pathname.replace(/\/+$/, "");
    return /(?:^|\/)login(?:\.html)?$/i.test(path);
  },
  isLoggedIn() {
    return localStorage.getItem(FAWNIA_KEYS.admin) === "true";
  },
  login(email, password) {
    if (
      email.trim().toLowerCase() === FAWNIA_ADMIN_DEMO.email &&
      password === FAWNIA_ADMIN_DEMO.password
    ) {
      localStorage.setItem(FAWNIA_KEYS.admin, "true");
      return true;
    }
    return false;
  },
  logout() {
    localStorage.removeItem(FAWNIA_KEYS.admin);
    location.href = FAWNIA_ADMIN_LOGIN_URL;
  },
  requireLogin() {
    if (!this.isLoggedIn()) location.replace(FAWNIA_ADMIN_LOGIN_URL);
  },
};

/* Guard: semua halaman admin selain login wajib masuk dulu */
if (!FawniaAuth.isLoginPage()) {
  FawniaAuth.requireLogin();
}

window.FawniaAuth = FawniaAuth;

document.addEventListener("DOMContentLoaded", () => {
  /* Tombol logout ada di semua halaman admin */
  document
    .querySelector("#logout")
    ?.addEventListener("click", () => FawniaAuth.logout());

  /* Form login */
  const form = document.querySelector("#login-form");
  if (!form) return;
  const error = document.querySelector("#error");
  const toggle = document.querySelector("#toggle");
  const passInput = document.querySelector("#password");

  toggle?.addEventListener("click", () => {
    const show = passInput.type === "password";
    passInput.type = show ? "text" : "password";
    toggle.textContent = show ? "Sembunyikan" : "Tampilkan";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const pass = passInput.value;
    if (FawniaAuth.login(email, pass)) location.href = FAWNIA_ADMIN_DASHBOARD_URL;
    else error.textContent = "Email atau password salah.";
  });
});
