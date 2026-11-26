# SKILLS — Peta Kemampuan & Panduan Pengembangan

Dokumen ini menjelaskan **kemampuan teknis yang sudah ada di kode** (bukan orang), di mana letaknya,
dan pola yang harus diikuti saat menambah fitur. Anggap ini “kartu skill” proyek.

---

## 1. Ringkasan Stack

| Lapisan | Teknologi | Berkas |
| --- | --- | --- |
| Markup | HTML5, multi-halaman | `index.html`, `pages/**/*.html` |
| Gaya | CSS3 murni (custom properties, grid, flex) | `css/base.css`, `css/landing.css`, `css/admin.css` |
| Logika | JavaScript ES2020+ (objek literal sebagai modul) | `js/**/*.js` |
| Ikon | [Lucide](https://lucide.dev) via CDN | `<script src="https://unpkg.com/lucide@latest">` |
| Data | `localStorage` (JSON) | `js/store.js`, `js/cart.js`, `js/auth-user.js` |
| QR | Implementasi QR Model 2 sendiri | `js/qr.js` |
| Build tool | Tidak ada | — |

---

## 2. Peta Modul & Kemampuan

### 2.1 Inti

| Modul | Skill / tanggung jawab | API utama |
| --- | --- | --- |
| `js/config.js` | Konstanta global: kunci storage, daftar ongkir & pembayaran, status pesanan, konten default | `FAWNIA_KEYS`, `FAWNIA_SHIPPING`, `FAWNIA_PAYMENTS`, `FAWNIA_ORDER_STATUS`, `FAWNIA_DEFAULTS` |
| `js/utils.js` | Format Rupiah/tanggal, escape HTML, normalisasi nomor WA, link `wa.me`, baca query string, bintang rating, file→data URL, toast, tombol kembali | `FawniaUtils.rupiah()`, `.esc()`, `.waLink()`, `.toast()` |
| `js/store.js` | CRUD generik + helper domain | `FawniaStore.getProducts()`, `.saveProduct()`, `.addOrder()`, `.updateOrder()` |
| `js/ui.js` | Logo, gambar dengan fallback, modal publik, pembuat field, lightbox, placeholder SVG | `FawniaUI.openModal()`, `.img()`, `.field()`, `.mountLogos()` |
| `js/cart.js` | Keranjang + drawer + badge + event perubahan | `FawniaCart.add()`, `.setQty()`, `.open()` |
| `js/auth-user.js` | Akun pembeli demo & sesi | `FawniaUserAuth.register()`, `.login()`, `.myOrders()` |
| `js/qr.js` | Generator QR (Reed-Solomon, masking, SVG) | `FawniaQr.dataUrl(text)` |

### 2.2 Bagian halaman

| Modul | Skill | Fungsi |
| --- | --- | --- |
| `js/sections/products.js` | Render kartu produk, pencarian real-time | `FawniaProductsSection.init()` / `.render(q)` |
| `js/sections/gallery.js` | Grid galeri + lightbox | `FawniaGallerySection.render()` |
| `js/sections/testimonials.js` | Kartu testimoni + bintang | `FawniaTestimonialsSection.render()` |
| `js/sections/shipping-payment.js` | Kartu info ongkir & bayar | `FawniaInfoSection.renderShipping()` / `.renderPayments()` |
| `js/sections/checkout.js` | Form checkout, validasi, ringkasan, QR, struk, cetak | `FawniaCheckout.init()` / `.renderSuccess()` |
| `js/pages/product-detail.js` | Halaman detail, stepper qty, beli sekarang | IIFE pada `DOMContentLoaded` |
| `js/pages/account.js` | Auth form, tab pesanan, profil, lacak, CS, FAQ | `FawniaAccount.init()` |

### 2.3 Panel admin

| Modul | Skill | Fungsi |
| --- | --- | --- |
| `js/admin/auth.js` | Login demo + guard halaman | `FawniaAuth.login()` / `.requireLogin()` |
| `js/admin/sidebar.js` | Header + sidebar dinamis | `FawniaAdminLayout.mount()` |
| `js/admin/common.js` | Modal admin, field builder, unggah gambar, badge | `FawniaAdmin.openModal()`, `.readImage()`, `.badge()` |
| `js/admin/dashboard.js` | Statistik & pesanan terbaru | `DOMContentLoaded` |
| `js/admin/products.js` | CRUD produk | — |
| `js/admin/gallery.js` | CRUD galeri + toggle visible | — |
| `js/admin/testimonials.js` | CRUD testimoni + toggle visible | — |
| `js/admin/orders.js` | Daftar pesanan, filter, cari, ubah status, hapus | — |
| `js/admin/messages.js` | Inbox pesan kontak | — |
| `js/admin/settings.js` | Pengaturan toko + reset data | — |

---

## 3. Pola Kode yang Wajib Diikuti

### 3.1 Urutan pemuatan skrip

```
config.js → utils.js → store.js → ui.js → cart.js
→ sections/*.js → qr.js → main.js  (landing)
→ auth-user.js → pages/*.js        (akun & checkout)
→ admin/auth.js → admin/common.js → admin/sidebar.js → admin/<halaman>.js
```

> `admin/auth.js` harus dimuat **pertama** di halaman admin agar guard berjalan sebelum render.

### 3.2 Escape setiap data dinamis

```js
// BENAR
grid.innerHTML = `<b>${FawniaUtils.esc(product.name)}</b>`;

// SALAH — rawan XSS
grid.innerHTML = `<b>${product.name}</b>`;
```

### 3.3 Tambah entitas baru (contoh: kategori)

1. Tambah kunci di `FAWNIA_KEYS` (`js/config.js`).
2. Tambah default di `FAWNIA_DEFAULTS`.
3. Tambah getter/save/delete di `js/store.js` dengan pola `_read`/`_upsert`/`_remove`.
4. Buat halaman admin `pages/admin/<entitas>.html` + `js/admin/<entitas>.js` (tiru `gallery.js`).
5. Daftarkan menu di `FAWNIA_ADMIN_MENU` (`js/admin/sidebar.js`).

### 3.4 Modal admin

```js
FawniaAdmin.openModal({
  title: "Tambah X",
  body: FawniaAdmin.field({ label: "Nama", name: "name", required: true }),
  submitLabel: "Simpan",
  onSubmit: async (modal) => {
    const f = modal.querySelector("#admin-modal-form");
    // validasi → lempar Error("pesan") bila gagal
  },
});
```

### 3.5 Unggah gambar

```js
const dataUrl = await FawniaAdmin.readImage(inputFile, ""); // maks 2 MB, harus image/*
const image = dataUrl || pathLama || "assets/img/bucket-1.png";
```

### 3.6 Toast & notifikasi

```js
FawniaUtils.toast("Produk disimpan");   // 3,2 detik
```

### 3.7 Delegasi event

Semua tombol dinamis memakai atribut `data-*` + satu listener di container
(`[data-add-to-cart]`, `[data-edit]`, `[data-delete]`, `[data-status]`, …).
Jangan memasang listener per item setelah render ulang.

### 3.8 Path relatif

- Halaman di `pages/` → `<html data-base="../">`
- Halaman di `pages/admin/` → `<html data-base="../../">`
- Selalu pakai `FawniaUI.base()` / `FawniaCart.pageBase()` saat membangun URL aset.

---

## 4. Kemampuan yang Belum Ada (Skill Gap)

| Keterampilan | Status | Tindak lanjut |
| --- | --- | --- |
| Integrasi backend/API | ❌ | lihat `docs/TODO.md` §6 |
| Autentikasi aman (hash, token) | ❌ | ganti `js/admin/auth.js` & `js/auth-user.js` |
| Pembayaran online | ❌ | ganti QR demo dengan gateway |
| Optimasi gambar otomatis | ❌ | kompresi canvas sebelum simpan |
| Test otomatis | ⚠️ sebagian | folder `.qa/` berisi skrip eksperimen |
| Aksesibilitas lanjutan (fokus trap, skip link) | ⚠️ dasar | tambah `aria-*` & fokus trap modal |
| PWA/offline | ❌ | service worker opsional |

---

## 5. Checklist Developer Sebelum Commit

- [ ] Komentar baru ditulis dalam **Bahasa Indonesia**.
- [ ] Tidak ada `console.log` sisa debug.
- [ ] Semua data dinamis lewat `FawniaUtils.esc`.
- [ ] Tombol baru memakai kelas `.btn` / `.mini-btn` / `.admin-btn` yang ada.
- [ ] Uji di lebar 390 px & 1280 px.
- [ ] Modal dapat ditutup dengan `Escape` dan klik backdrop.
- [ ] Perbarui `docs/PRD.md` & `docs/TODO.md` bila perilaku berubah.

---

## 6. Perintah Berguna

```powershell
# Jalankan server lokal
npx http-server . -p 8099

# Cek sintaks semua JS (butuh Node.js)
Get-ChildItem -Recurse js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Buka:

- Website: `http://localhost:8099/index.html`
- Admin: `http://localhost:8099/pages/admin/login.html`

---

## 7. Referensi

- [PRD](PRD.md)
- [TO-DO List](TODO.md)
- [Panduan Pengguna](BUKU-PANDUAN.md)
- [Panduan Developer](PANDUAN-DEVELOPER.md)
