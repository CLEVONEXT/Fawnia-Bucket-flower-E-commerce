/* ============================================================
   js/pages/account.js — Halaman "Akun Saya" ala marketplace
   Tab: Semua, Belum Bayar, Dikemas, Dikirim, Selesai
   + Profil, Lacak Pengiriman, CS, Pusat Bantuan
   ============================================================ */

const FawniaAccount = {
  tab: "semua",

  init() {
    const root = document.querySelector("#account-root");
    if (!root) return;
    FawniaUI.mountLogos();

    if (!FawniaUserAuth.current()) {
      this.renderAuthForm(root);
      return;
    }
    this.renderApp(root);
  },

  /* ================= LOGIN / REGISTER ================= */
  renderAuthForm(root) {
    const next = FawniaUtils.getParam("next") || "";
    document.title = "Masuk / Daftar — Fawnia Shop";

    root.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-tabs">
          <button type="button" class="auth-tab active" data-auth="login">Masuk</button>
          <button type="button" class="auth-tab" data-auth="register">Daftar</button>
        </div>

        <form id="auth-form" class="checkout-form auth-form" novalidate>
          <div data-fields="register" style="display:none">
            <div class="form-row">
              <label class="field">Nama lengkap<input name="name" type="text" placeholder="Nama kamu"></label>
              <label class="field">Nomor WhatsApp<input name="phone" type="tel" placeholder="0812xxxxxxx"></label>
            </div>
          </div>
          <label class="field">Email<input name="email" type="email" placeholder="email@contoh.com" required></label>
          <label class="field">Password<input name="password" type="password" placeholder="Min. 6 karakter" required></label>
          <p class="error" id="auth-error"></p>
          <button type="submit" class="btn btn-primary btn-block" id="auth-submit">Masuk</button>
        </form>

        <p class="auth-hint">Akun demo tersimpan hanya di browser ini (localStorage).</p>
      </div>`;

    let mode = "login";
    root.querySelectorAll(".auth-tab").forEach((b) => {
      b.addEventListener("click", () => {
        mode = b.dataset.auth;
        root
          .querySelectorAll(".auth-tab")
          .forEach((x) => x.classList.toggle("active", x === b));
        root.querySelector('[data-fields="register"]').style.display =
          mode === "register" ? "block" : "none";
        root.querySelector("#auth-submit").textContent =
          mode === "register" ? "Daftar" : "Masuk";
      });
    });

    root.querySelector("#auth-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const error = root.querySelector("#auth-error");
      try {
        if (mode === "register") {
          const name = f.name.value.trim();
          if (!name || f.password.value.length < 6) {
            throw new Error("Nama wajib diisi & password min. 6 karakter.");
          }
          FawniaUserAuth.register({
            name,
            phone: f.phone.value.trim(),
            email: f.email.value.trim(),
            password: f.password.value,
          });
        } else {
          FawniaUserAuth.login(f.email.value, f.password.value);
        }
        location.href = next ? next : "account.html";
      } catch (err) {
        error.textContent = err.message;
      }
    });
  },

  /* ================= APP SETELAH LOGIN ================= */
  renderApp(root) {
    const user = FawniaUserAuth.current();
    document.title = "Akun Saya — Fawnia Shop";

    const orders = FawniaUserAuth.myOrders();
    const count = (tabId) => {
      if (tabId === "semua") return orders.length;
      const tab = FAWNIA_USER_TABS.find((t) => t.id === tabId);
      return orders.filter((o) => tab.statuses.includes(o.status)).length;
    };

    root.innerHTML = `
      <div class="account-head">
        <span class="avatar"><i data-lucide="user"></i></span>
        <div>
          <h1>${FawniaUtils.esc(user.name)}</h1>
          <p>${FawniaUtils.esc(user.email)} · ${FawniaUtils.esc(user.phone || "-")}</p>
        </div>
        <div class="account-head-actions">
          <button type="button" class="btn btn-ghost" id="edit-profile"><i data-lucide="pencil"></i> Edit Profil</button>
          <button type="button" class="btn btn-ghost" id="logout-user"><i data-lucide="log-out"></i> Keluar</button>
        </div>
      </div>

      <div class="account-menu">
        <a class="account-menu-item" href="#" data-panel="tracking">
          <i data-lucide="map-pin"></i><b>Lacak Pengiriman</b><span>Cek status & resi</span>
        </a>
        <a class="account-menu-item" href="#" data-panel="cs">
          <i data-lucide="headset"></i><b>Customer Service</b><span>Chat admin via WA</span>
        </a>
        <a class="account-menu-item" href="#" data-panel="help">
          <i data-lucide="circle-help"></i><b>Pusat Bantuan</b><span>FAQ & panduan</span>
        </a>
      </div>

      <h2 class="account-sub">Riwayat Pesanan</h2>
      <div class="order-tabs" id="order-tabs">
        <button type="button" class="order-tab active" data-tab="semua">Semua <span>${count("semua")}</span></button>
        ${FAWNIA_USER_TABS.map(
          (t) =>
            `<button type="button" class="order-tab" data-tab="${t.id}">${t.label} <span>${count(t.id)}</span></button>`,
        ).join("")}
      </div>
      <div id="order-list-account"></div>

      <div id="account-panel" class="modal-backdrop" style="display:none"></div>`;

    this.renderOrders();

    /* Tab */
    root.querySelectorAll(".order-tab").forEach((b) => {
      b.addEventListener("click", () => {
        this.tab = b.dataset.tab;
        root
          .querySelectorAll(".order-tab")
          .forEach((x) => x.classList.toggle("active", x === b));
        this.renderOrders();
      });
    });

    /* Logout & edit profil */
    root.querySelector("#logout-user").addEventListener("click", () => {
      FawniaUserAuth.logout();
      location.reload();
    });
    root
      .querySelector("#edit-profile")
      .addEventListener("click", () => this.editProfile());

    /* Panel: lacak / cs / help */
    root.querySelectorAll("[data-panel]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const panel = el.dataset.panel;
        if (panel === "tracking") this.openTracking();
        if (panel === "cs") this.openCS();
        if (panel === "help") this.openHelp();
      });
    });

    /* Aksi pada kartu pesanan */
    root.querySelector("#order-list-account").addEventListener("click", (e) => {
      const pay = e.target.closest("[data-pay]");
      const receive = e.target.closest("[data-receive]");
      const track = e.target.closest("[data-track]");
      const cancel = e.target.closest("[data-cancel]");
      const id = (pay || receive || track || cancel)?.dataset[
        pay ? "pay" : receive ? "receive" : track ? "track" : "cancel"
      ];
      if (pay) {
        location.href = `checkout.html?done=1&id=${encodeURIComponent(id)}`;
      }
      if (receive && confirm("Konfirmasi pesanan sudah diterima?")) {
        FawniaStore.updateOrder(id, {
          status: "Selesai",
          receivedAt: new Date().toISOString(),
        });
        FawniaUtils.toast("Pesanan ditandai selesai");
        this.renderApp(root);
      }
      if (track) this.openTracking(id);
      if (cancel && confirm("Batalkan pesanan ini?")) {
        FawniaStore.updateOrder(id, { status: "Dibatalkan" });
        FawniaUtils.toast("Pesanan dibatalkan");
        this.renderApp(root);
      }
    });

    FawniaUI.icons();
  },

  /* ---------- Kartu pesanan per tab ---------- */
  renderOrders() {
    const box = document.querySelector("#order-list-account");
    const orders = FawniaUserAuth.myOrders();
    const tab = FAWNIA_USER_TABS.find((t) => t.id === this.tab);
    const list = tab
      ? orders.filter((o) => tab.statuses.includes(o.status))
      : orders;

    if (!list.length) {
      box.innerHTML = `
        <div class="empty-state">
          <p>Belum ada pesanan di tab ini.</p>
          <a class="btn btn-primary" style="margin-top:12px" href="../index.html#products">Belanja Sekarang</a>
        </div>`;
      return;
    }

    const settings = FawniaStore.getSettings();
    const statusLabel = (s) =>
      ({
        Baru: "Belum Bayar",
        Diproses: "Dikemas",
        Dikirim: "Dikirim",
        Selesai: "Selesai",
        Dibatalkan: "Dibatalkan",
      })[s] || s;

    box.innerHTML = list
      .map((o) => {
        const items = o.items || [
          { name: o.productName, qty: 1, price: o.subtotal, image: "" },
        ];
        return `
        <article class="order-account-card">
          <header>
            <div><b>${FawniaUtils.esc(o.id)}</b><small>${FawniaUtils.tanggal(o.createdAt)}</small></div>
            ${FawniaAdminBadge(statusLabel(o.status))}
          </header>
          <div class="order-account-items">
            ${items
              .slice(0, 3)
              .map(
                (i) => `
              <div class="order-account-item">
                <span class="thumb">${FawniaUI.img(i.image, i.name)}</span>
                <div><b>${FawniaUtils.esc(i.name)}</b><small>${i.qty}x · ${FawniaUtils.rupiah(i.price)}</small></div>
              </div>`,
              )
              .join("")}
            ${items.length > 3 ? `<small class="muted-note">+${items.length - 3} produk lainnya</small>` : ""}
          </div>
          <footer>
            <div class="order-account-total">
              <span>Total Pesanan</span>
              <strong>${FawniaUtils.rupiah(FawniaStore.orderTotal(o))}</strong>
            </div>
            <div class="row-actions">
              ${o.status === "Baru" ? `<a class="mini-btn pay" href="checkout.html?done=1&id=${encodeURIComponent(o.id)}">Bayar Sekarang</a>` : ""}
              ${o.status === "Diproses" ? `<button type="button" class="mini-btn" data-cancel="${FawniaUtils.esc(o.id)}">Batalkan</button>` : ""}
              ${
                o.status === "Dikirim"
                  ? `<button type="button" class="mini-btn" data-track="${FawniaUtils.esc(o.id)}">Lacak</button>
                                            <button type="button" class="mini-btn pay" data-receive="${FawniaUtils.esc(o.id)}">Diterima</button>`
                  : ""
              }
              ${o.status === "Selesai" ? `<button type="button" class="mini-btn" data-track="${FawniaUtils.esc(o.id)}">Lihat Rincian</button>` : ""}
              <a class="mini-btn" target="_blank" rel="noopener"
                 href="${FawniaUtils.waLink(settings.whatsapp, `Halo ${settings.businessName}, saya ingin bertanya soal pesanan ${o.id}.`)}">Chat</a>
            </div>
          </footer>
        </article>`;
      })
      .join("");
  },

  /* ---------- Edit profil ---------- */
  editProfile() {
    const user = FawniaUserAuth.current();
      FawniaUI.openModal({
      title: "Edit Profil",
      body: `
        ${FawniaUI.field({ label: "Nama lengkap", name: "name", value: user.name, required: true })}
        ${FawniaUI.field({ label: "Nomor WhatsApp", name: "phone", value: user.phone })}
        ${FawniaUI.field({ label: "Alamat default", name: "address", type: "textarea", value: user.address, rows: 2 })}`,
      onSubmit: (modal) => {
        const f = modal.querySelector("#public-modal-form");
        const name = f.querySelector('[name="name"]').value.trim();
        if (!name) throw new Error("Nama wajib diisi.");
        FawniaUserAuth.updateProfile({
          name,
          phone: f.querySelector('[name="phone"]').value.trim(),
          address: f.querySelector('[name="address"]').value.trim(),
        });
        FawniaUtils.toast("Profil diperbarui");
        this.renderApp(document.querySelector("#account-root"));
      },
    });
  },

  /* ---------- Lacak pengiriman ---------- */
  openTracking(orderId = null) {
    const orders = FawniaUserAuth.myOrders().filter((o) =>
      ["Diproses", "Dikirim", "Selesai"].includes(o.status),
    );
    const selected = orderId ? orders.find((o) => o.id === orderId) : orders[0];
    const steps = ["Dikemas", "Dikirim", "Selesai"];
    const idx = selected
      ? Math.max(
          0,
          steps.indexOf(
            { Diproses: "Dikemas", Dikirim: "Dikirim", Selesai: "Selesai" }[
              selected.status
            ],
          ),
        )
      : -1;

    FawniaUI.openModal({
      title: "Lacak Pengiriman",
      submitLabel: "Tutup",
      body: `
        ${
          orders.length
            ? FawniaUI.field({
                label: "Pilih pesanan",
                name: "order",
                type: "select",
                value: selected?.id,
                options: orders.map((o) => ({
                  value: o.id,
                  label: `${o.id} — ${o.productName}`,
                })),
              })
            : `<p class="muted">Belum ada pesanan yang bisa dilacak.</p>`
        }
        ${
          selected
            ? `<div class="tracking">
                 <div class="tracking-head">
                   <div><b>${FawniaUtils.esc(selected.id)}</b><small>${FawniaUtils.esc(FawniaStore.shippingLabel(selected.shipping))}</small></div>
                   <code class="resi">${selected.resi ? FawniaUtils.esc(selected.resi) : "Resi belum tersedia"}</code>
                 </div>
                 <ol class="tracking-steps">
                   <li class="${idx >= 0 ? "done" : ""}"><b>Dikemas</b><small>${idx >= 0 ? "Pesanan sedang dikemas penjual" : "Menunggu pembayaran"}</small></li>
                   <li class="${idx >= 1 ? "done" : ""}"><b>Dikirim</b><small>${idx >= 1 ? "Paket diserahkan ke kurir" : "—"}</small></li>
                   <li class="${idx >= 2 ? "done" : ""}"><b>Selesai</b><small>${idx >= 2 ? "Paket diterima" : "—"}</small></li>
                 </ol>
                 <p class="muted" style="font-size:12px">*Demo: status mengikuti data panel admin.</p>
               </div>`
            : ""
        }`,
      onSubmit: () => true,
    });
  },

  /* ---------- Customer service ---------- */
  openCS() {
    const settings = FawniaStore.getSettings();
    const orders = FawniaUserAuth.myOrders();
    FawniaUI.openModal({
      title: "Customer Service",
      submitLabel: "Chat Sekarang",
      body: `
        <p class="muted">Ada kendala dengan pesananmu? Admin Fawnia siap membantu:</p>
        ${orders.length ? FawniaUI.field({
          label: "Pesanan terkait (opsional)",
          name: "order",
          type: "select",
          options: [
            { value: "", label: "— Umum —" },
            ...orders.map((order) => ({
              value: order.id,
              label: `${order.id} — ${order.productName || "Pesanan"}`,
            })),
          ],
        }) : ""}
        <div class="mini-row"><b>Jam operasional</b><span>09.00 – 21.00 WIB</span></div>
        <div class="mini-row"><b>WhatsApp</b><span>${FawniaUtils.esc(settings.whatsapp)}</span></div>
        <div class="mini-row"><b>Email</b><span>${FawniaUtils.esc(settings.email)}</span></div>`,
      onSubmit: (modal) => {
        const sel = modal.querySelector('[name="order"]');
        const id = sel ? sel.value : "";
        window.open(
          FawniaUtils.waLink(
            settings.whatsapp,
            `Halo ${settings.businessName}, saya butuh bantuan${id ? ` terkait pesanan ${id}` : ""}.`,
          ),
          "_blank",
        );
      },
    });
  },

  /* ---------- Pusat bantuan ---------- */
  openHelp() {
    const faq = [
      [
        "Bagaimana cara membayar?",
        "Pilih metode pembayaran saat checkout (transfer, QRIS, e-wallet, COD). Setelah pesanan dibuat, scan QR / transfer lalu kirim bukti ke WhatsApp admin.",
      ],
      [
        "Berapa lama pesanan dikirim?",
        "Ambil di toko: siap 1 hari. Kurir lokal/instant: hari yang sama. Ekspedisi (JNE/J&T/SiCepat): 2–4 hari.",
      ],
      [
        "Apakah bisa request custom?",
        "Bisa! Tulis warna/tema/ucapan di kolom catatan saat checkout, atau chat admin via WhatsApp.",
      ],
      [
        "Bagaimana jika paket rusak?",
        "Foto kemasan & isi paket, lalu hubungi Customer Service maksimal 1×24 jam setelah paket diterima.",
      ],
      [
        "Bisa refund?",
        "Refund dapat diajukan jika pesanan belum dikemas. Hubungi CS dengan nomor pesanan kamu.",
      ],
    ];
    FawniaUI.openModal({
      title: "Pusat Bantuan",
      submitLabel: "Tutup",
      body: faq
        .map(
          ([q, a]) => `
        <details class="faq-item">
          <summary>${FawniaUtils.esc(q)}</summary>
          <p>${FawniaUtils.esc(a)}</p>
        </details>`,
        )
        .join(""),
      onSubmit: () => true,
    });
  },
};

function FawniaAdminBadge(text) {
  const key = String(text).toLowerCase().replace(/\s+/g, "-");
  return `<span class="status status-${FawniaUtils.esc(key)}">${FawniaUtils.esc(text)}</span>`;
}

/* Field builder versi halaman publik (sama format dengan admin) */
function FawniaUIField({ label, name, type = "text", value = "", required = false, options, rows = 3 }) {
  const v = FawniaUtils.esc(value);
  let control = "";
  if (type === "textarea") {
    control = `<textarea name="${name}" rows="${rows}" ${required ? "required" : ""}>${v}</textarea>`;
  } else if (type === "select") {
    control = `<select name="${name}" ${required ? "required" : ""}>${(options || [])
      .map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return `<option value="${FawniaUtils.esc(opt.value)}" ${String(opt.value) === String(value) ? "selected" : ""}>${FawniaUtils.esc(opt.label)}</option>`;
      })
      .join("")}</select>`;
  } else {
    control = `<input name="${name}" type="${type}" value="${v}" ${required ? "required" : ""}>`;
  }
  return `<label class="field">${FawniaUtils.esc(label)}${required ? " *" : ""}${control}</label>`;
}

window.FawniaAccount = FawniaAccount;
document.addEventListener("DOMContentLoaded", () => FawniaAccount.init());
