/* ============================================================
   js/auth-user.js — Akun pembeli (demo, localStorage)
   Register / login / session. Dipakai halaman akun & checkout.
   ============================================================ */

const FawniaUserAuth = {
  /* ---------- Users ---------- */
  users() {
    try {
      return JSON.parse(localStorage.getItem(FAWNIA_KEYS.users)) || [];
    } catch (e) {
      return [];
    }
  },
  _saveUsers(users) {
    localStorage.setItem(FAWNIA_KEYS.users, JSON.stringify(users));
  },

  /* ---------- Session ---------- */
  current() {
    try {
      const email = JSON.parse(localStorage.getItem(FAWNIA_KEYS.session));
      if (!email) return null;
      return this.users().find((u) => u.email === email) || null;
    } catch (e) {
      return null;
    }
  },
  _setSession(email) {
    localStorage.setItem(FAWNIA_KEYS.session, JSON.stringify(email));
  },

  register({ name, phone, email, password }) {
    const users = this.users();
    if (users.some((u) => u.email === email.toLowerCase())) {
      throw new Error("Email sudah terdaftar. Silakan login.");
    }
    const user = {
      id: Date.now(),
      name,
      phone,
      email: email.toLowerCase(),
      password /* demo lokal saja — production pakai hash di backend */,
      address: "",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    this._saveUsers(users);
    this._setSession(user.email);
    return user;
  },

  login(email, password) {
    const user = this.users().find(
      (u) => u.email === email.toLowerCase().trim() && u.password === password,
    );
    if (!user) throw new Error("Email atau password salah.");
    this._setSession(user.email);
    return user;
  },

  logout() {
    localStorage.removeItem(FAWNIA_KEYS.session);
  },

  updateProfile(patch) {
    const user = this.current();
    if (!user) return null;
    const users = this.users();
    const idx = users.findIndex((u) => u.email === user.email);
    users[idx] = { ...users[idx], ...patch };
    this._saveUsers(users);
    this._setSession(users[idx].email);
    return users[idx];
  },

  /* ---------- Pesanan milik user login ---------- */
  myOrders() {
    const user = this.current();
    if (!user) return [];
    return FawniaStore.getOrders().filter(
      (o) => o.userId === user.id || o.phone === user.phone,
    );
  },

  requireLogin(redirect = "login.html") {
    if (!this.current()) {
      location.href =
        redirect +
        "?next=" +
        encodeURIComponent(
          location.pathname.split("/").pop() + location.search,
        );
      return false;
    }
    return true;
  },
};

window.FawniaUserAuth = FawniaUserAuth;
