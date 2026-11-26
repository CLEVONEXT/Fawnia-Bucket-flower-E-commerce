
# PRD — Fawnia Bucket & Gift E-Commerce

| Field | Isi |
| --- | --- |
| Nama produk | Fawnia Website (vanilla) |
| Versi dokumen | 1.0 |
| Versi produk | Demo/prototipe (MVP) |
| Tanggal | 26 November 2026 |
| Pemilik | UMKM Fawnia |
| Teknologi | HTML + CSS + JavaScript vanilla, tanpa build tool, data di `localStorage` |

---

## 1. Latar Belakang & Tujuan

UMKM Fawnia menjual bucket, gift, dan hamper. Pemesanan sebelumnya dilakukan manual lewat chat.
Website ini dibuat agar pengunjung bisa:

1. melihat katalog dan galeri produk,
2. memasukkan produk ke keranjang,
3. melakukan checkout langsung dari website (pesanan tercatat di panel admin),
4. alternatif checkout lewat WhatsApp,
5. memantau pesanan sendiri di halaman **Akun** (tanpa perlu chat admin),

sementara pemilik toko mengelola produk, galeri, testimoni, pesanan, pesan, dan profil toko lewat **panel admin**.

**Tujuan terukur (MVP)**

- Checkout selesai dari halaman website ≤ 3 langkah (keranjang → checkout → struk).
- Data toko (produk, kontak, rekening) dapat diubah admin tanpa menyentuh kode.
- Semua halaman responsif hingga lebar 360 px.

---

## 2. Pengguna & Persona

| Persona | Kebutuhan utama | Halaman yang dipakai |
| --- | --- | --- |
| **Pembeli baru** | Tahapan tanpa registrasi, lihat harga & stok, checkout cepat | Landing, detail produk, keranjang, checkout |
| **Pembeli terdaftar** | Riwayat pesanan, lacak kiriman, ubah profil | Akun, checkout |
| **Pemilik/Admin** | Kelola katalog, pesanan, testimoni, pengaturan toko | Panel admin |
| **Pengembang** | Struktur kode terpisah, mudah disambungkan ke backend | Seluruh `js/` |

---

## 3. Ruang Lingkup

### 3.1 Halaman publik

| Halaman | Berkas | Isi |
| --- | --- | --- |
| Landing / Home | `index.html` | Top bar promo, header + pencarian, hero, keunggulan, grid produk, galeri, info pengiriman & pembayaran, CTA checkout, testimoni, kontak, footer, bottom nav mobile, cart drawer, lightbox |
| Detail produk | `pages/product-detail.html` | Gambar, label, nama, rating, stok, deskripsi, harga, stepper qty, Masukkan Keranjang, Beli Sekarang, tombol chat WA, info layanan, produk terkait |
| Checkout | `pages/checkout.html` | Daftar item (dapat dihapus), form data pengiriman, pilih kirim & bayar, ringkasan biaya, Buat Pesanan, Pesan via WhatsApp |
| Struk / sukses | `pages/checkout.html?done=1&id=…` | QR pembayaran (demo), struk lengkap, cetak struk, konfirmasi via WhatsApp |
| Akun Saya | `pages/account.html` | Form masuk/daftar, profil, menu Lacak Pengiriman / Customer Service / Pusat Bantuan, riwayat pesanan dengan tab status |

### 3.2 Panel admin

| Halaman | Berkas | Fungsi |
| --- | --- | --- |
| Login | `pages/admin/login.html` | Login demo (email + password), toggle tampilkan password |
| Dashboard | `pages/admin/dashboard.html` | Statistik jumlah produk, galeri, testimoni, pesanan, pesan, estimasi omzet, 5 pesanan terbaru |
| Produk | `pages/admin/products.html` | Tambah / ubah / hapus, stok, label, status Aktif/Nonaktif, path gambar / unggah gambar |
| Galeri | `pages/admin/gallery.html` | Tambah / ubah / hapus, sembunyikan/tampilkan foto |
| Testimoni | `pages/admin/testimonials.html` | Tambah / ubah / hapus, rating 1–5, sembunyikan/tampilkan |
| Pesanan | `pages/admin/orders.html` | Filter status, pencarian, ubah status, chat WA pembeli, hapus pesanan |
| Pesan | `pages/admin/messages.html` | Inbox pesan (`fawnia_messages`), balas via WA, hapus |
| Pengaturan | `pages/admin/settings.html` | Nama toko, tagline, WA, Instagram, email, alamat, catatan kirim, rekening, catatan QRIS, info kirim/bayar (baca saja), reset data demo |

---

## 4. Kebutuhan Fungsional

Kode kebutuhan: `F-xx`. Prioritas: **P1** (wajib MVP), **P2** (penting), **P3** (nice to have).

### 4.1 Katalog & produk

| ID | Kebutuhan | Prioritas | Implementasi |
| --- | --- | --- | --- |
| F-01 | Menampilkan produk aktif dalam grid kartu marketplace (harga, label, rating, terjual, stok terbatas/habis) | P1 | `js/sections/products.js` → `FawniaProductsSection.render()` |
| F-02 | Pencarian produk real-time berdasarkan nama, deskripsi, label | P1 | `render(query)` + listener `input` pada `#search-input` |
| F-03 | Menampilkan jumlah hasil pencarian | P2 | elemen `#product-result` |
| F-04 | Produk berstatus `Nonaktif` tidak tampil di publik | P1 | `FawniaStore.getActiveProducts()` |
| F-05 | Halaman detail produk dengan fallback ke produk pertama bila `id` tidak valid | P2 | `js/pages/product-detail.js` |
| F-06 | Tombol keranjang & beli dinonaktifkan saat stok 0 | P1 | atribut `disabled` berdasarkan `stock` |
| F-07 | Produk terkait (maks 4) pada halaman detail | P3 | `related` di `product-detail.js` |

### 4.2 Keranjang

| ID | Kebutuhan | Prioritas | Implementasi |
| --- | --- | --- | --- |
| F-08 | Keranjang tersimpan di `localStorage` (kunci `fawnia_cart`) | P1 | `js/cart.js` |
| F-09 | Drawer keranjang dari kanan dengan stepper qty (1–99), hapus item, kosongkan | P1 | `ensureDrawer()`, `renderItems()` |
| F-10 | Badge jumlah item di header & bottom nav (maks tampil `99+`) | P1 | `updateBadge()` |
| F-11 | Sinkron antar-tab browser | P2 | listener `storage` pada `FawniaCart.init()` |
| F-12 | Event `fawnia:cart-changed` untuk komponen lain | P2 | `_write()` |

### 4.3 Checkout & pesanan

| ID | Kebutuhan | Prioritas | Implementasi |
| --- | --- | --- | --- |
| F-13 | Form checkout: nama, WhatsApp (min. 8 digit), alamat (wajib selain pickup), metode kirim, metode bayar, catatan | P1 | `js/sections/checkout.js` → `validate()` |
| F-14 | Ringkasan biaya otomatis (subtotal + ongkir + total) saat metode kirim berubah | P1 | `calc()` |
| F-15 | Menyimpan pesanan ke `fawnia_orders` dengan id `FWN-xxxxxx`, status awal `Baru` | P1 | `FawniaStore.addOrder()` |
| F-16 | Hapus item dari halaman checkout | P2 | delegasi `[data-remove]` |
| F-17 | Checkout via WhatsApp: ringkasan pesanan diformat ke pesan WA | P2 | `#checkout-wa` |
| F-18 | Halaman sukses menampilkan QR pembayaran demo (pola unik per pesanan), struk, tombol cetak, konfirmasi WA | P1 | `renderSuccess()` |
| F-19 | Pesanan otomatis terkait ke akun pembeli bila sedang login | P2 | `userId` / `phone` pada `FawniaUserAuth.myOrders()` |

### 4.4 Akun pembeli

| ID | Kebutuhan | Prioritas | Implementasi |
| --- | --- | --- | --- |
| F-20 | Daftar akun (nama, WA, email, password ≥ 6) & masuk (demo, `localStorage`) | P1 | `js/auth-user.js`, `js/pages/account.js` |
| F-21 | Sesi disimpan di `fawnia_session`; logout menghapus sesi | P1 | `FawniaUserAuth` |
| F-22 | Riwayat pesanan dengan tab Semua / Belum Bayar / Dikemas / Dikirim / Selesai + badge jumlah | P1 | `renderOrders()` |
| F-23 | Aksi pesanan: Bayar Sekarang (buka struk), Batalkan, Diterima, Lacak, Chat | P1 | delegasi `[data-pay]`, `[data-cancel]`, `[data-receive]`, `[data-track]` |
| F-24 | Lacak pengiriman: step Dikemas → Dikirim → Selesai + nomor resi | P2 | `openTracking()` |
| F-25 | Customer Service: chat WA dengan opsi pesanan terkait | P2 | `openCS()` |
| F-26 | Pusat Bantuan: 5 FAQ accordion | P2 | `openHelp()` |
| F-27 | Edit profil (nama, WA, alamat default) | P2 | `editProfile()` |
| F-28 | Redirect ke halaman login dengan parameter `next` bila belum masuk | P2 | `FawniaUserAuth.requireLogin()` |

### 4.5 Konten pendukung

| ID | Kebutuhan | Prioritas | Implementasi |
| --- | --- | --- | --- |
| F-29 | Galeri foto + lightbox, hanya foto `visible` | P1 | `js/sections/gallery.js`, `FawniaUI.initLightbox()` |
| F-30 | Testimoni (rating bintang), hanya testimoni `visible` | P1 | `js/sections/testimonials.js` |
| F-31 | Info metode pengiriman & pembayaran | P1 | `js/sections/shipping-payment.js` |
| F-32 | Logo otomatis dari `assets/img/fawnia-logo.png` (fallback huruf “F”) | P2 | `FawniaUI.mountLogos()` |
| F-33 | Placeholder SVG otomatis bila gambar tidak ditemukan | P2 | `FawniaImages.placeholderSvg()` |
| F-34 | Tombol “Kembali” otomatis di halaman selain landing | P3 | `FawniaUtils.mountBackButton()` |
| F-35 | Toast notifikasi singkat (3,2 s) | P2 | `FawniaUtils.toast()` |

### 4.6 Panel admin

| ID | Kebutuhan | Prioritas | Implementasi |
| --- | --- | --- | --- |
| F-36 | Proteksi halaman admin: redirect ke login bila belum masuk | P1 | `js/admin/auth.js` → `requireLogin()` |
| F-37 | Header + sidebar admin dengan menu aktif sesuai berkas | P1 | `js/admin/sidebar.js` |
| F-38 | CRUD produk dengan unggah gambar (≤ 2 MB) atau path gambar | P1 | `js/admin/products.js` |
| F-39 | CRUD galeri + toggle tampil/sembunyi | P1 | `js/admin/gallery.js` |
| F-40 | CRUD testimoni + rating + toggle tampil/sembunyi | P1 | `js/admin/testimonials.js` |
| F-41 | Ubah status pesanan & hapus pesanan, filter & pencarian | P1 | `js/admin/orders.js` |
| F-42 | Inbox pesan kontak + balas via WA | P2 | `js/admin/messages.js` |
| F-43 | Pengaturan toko + reset data ke default | P1 | `js/admin/settings.js` |
| F-44 | Aksen rahasia: klik 3× tautan “Admin” di footer untuk masuk panel | P2 | `js/main.js` → `data-admin-trigger` |

---

## 5. Kebutuhan Non-Fungsional

| Aspek | Ketentuan |
| --- | --- |
| **Tanpa build tool** | Semua skrip dimuat langsung lewat `<script>`; urutan: `config → utils → store → ui → cart → sections → qr → main`. |
| **Keamanan** | Semua teks dinamis di-escape via `FawniaUtils.esc()` sebelum masuk `innerHTML`. Password demo **tidak** di-hash → hanya untuk prototipe. |
| **Kinerja** | Gambar `loading="lazy"`, render ulang seperlunya; payload total < 500 KB (tanpa gambar) ideal. |
| **Responsif** | Desktop (≥ 1024 px), tablet, mobile (360–430 px); bottom nav khusus mobile. |
| **Aksesibilitas** | `aria-label` pada tombol ikon, `role="dialog"` + `aria-modal` pada modal, tutup dengan `Escape`, fokus otomatis ke input modal admin. |
| **Kompatibilitas** | Browser modern (Chrome, Edge, Firefox, Safari); memakai `structuredClone`, `Intl.NumberFormat`, `IntersectionObserver`, `TextEncoder`. |
| **Offline** | Bekerja tanpa server (file lokal) kecuali ikon lucide (CDN). |
| **Data** | Satu sumber kebenaran: `FAWNIA_KEYS` di `js/config.js`. |

---

## 6. Model Data (`localStorage`)

| Kunci | Bentuk | Keterangan |
| --- | --- | --- |
| `fawnia_products` | `{id, name, price, description, label, image, stock, status}[]` | `status`: `Aktif` / `Nonaktif` |
| `fawnia_gallery` | `{id, title, image, visible}[]` | `visible: false` disembunyikan |
| `fawnia_testimonials` | `{id, name, text, rating, visible}[]` | rating 1–5 |
| `fawnia_orders` | `{id, createdAt, status, items[], productName, subtotal, shipping, shippingCost, payment, total, name, phone, address, note, source, userId}` | status: Baru / Diproses / Dikirim / Selesai / Dibatalkan |
| `fawnia_settings` | `{businessName, tagline, whatsapp, instagram, email, address, shippingNote, bankAccount, qrisNote}` | di-merge dengan default |
| `fawnia_admin` | `"true"` | penanda login admin |
| `fawnia_session` | `"email@..."` | email pembeli yang aktif |
| `fawnia_users` | `{id, name, phone, email, password, address, createdAt}[]` | akun pembeli (demo) |
| `fawnia_cart` | `{id, name, price, image, label, qty}[]` | dikelola `js/cart.js` |
| `fawnia_messages` | `{id, name, phone, message, createdAt}[]` | inbox admin |

---

## 7. Alur Utama

**Pembeli (website)**

1. Landing → pilih produk / cari → detail produk.
2. Masukkan Keranjang (drawer) atau Beli Sekarang.
3. Checkout: isi data, pilih kirim & bayar → **Buat Pesanan & Bayar**.
4. Struk & QR tampil → cetak / konfirmasi WA.
5. Pesanan muncul di halaman Akun (tab Belum Bayar) → status berubah setelah admin proses.

**Admin**

1. Login → Dashboard.
2. Cek Pesanan → ubah status `Baru → Diproses → Dikirim (+ resi) → Selesai`; chat WA pembeli.
3. Kelola Produk / Galeri / Testimoni / Pesan / Pengaturan.

---

## 8. Di Luar Ruang Lingkup (MVP)

- Backend & database nyata, autentikasi server, hashing password.
- Pembayaran online (payment gateway / QRIS dinamis asli).
- Perhitungan ongkir otomatis dari API ekspedisi.
- Upload gambar ke storage (saat ini data URL di localStorage).
- Stok berkurang otomatis setelah checkout.
- Multi-admin & hak akses.

---

## 9. Kriteria Penerimaan (Definition of Done)

- [ ] Semua kebutuhan **P1** dapat didemokan tanpa error konsol.
- [ ] Checkout dari keranjang kosong menampilkan pesan ramah, bukan error.
- [ ] Pesanan yang dibuat di website terlihat di panel admin dan di Akun pembeli.
- [ ] Produk proses dengan `Nonaktif` tidak muncul di landing maupun detail produk.
- [ ] Gambar yang hilang tidak merusak tata letak (placeholder tampil).
- [ ] Tampilan mobile 390 px: tidak ada horizontal scroll, bottom nav berfungsi.
- [ ] `Edit Profil`, `Batalkan`, `Diterima` mengambil efek pada data pesanan.
- [ ] Reset data di Pengaturan mengembalikan seluruh konten ke default (kecuali sesi admin).

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Data hilang saat browser dibersihkan | Pesanan/produk hilang | Fitur ekspor data / migrasi ke backend (lihat TODO) |
| Login demo hardcoded | Tidak aman untuk production | Ganti dengan backend auth sebelum go-live |
| QR pembayaran demo | Pembeli bisa salah paham | Teks peringatan sudah ditampilkan; ganti QRIS asli saat production |
| Kuota `localStorage` (~5 MB) | Unggah banyak gambar gagal | Gunakan path gambar atau storage eksternal |
| Ikon lucide dari CDN | Ikon hilang saat offline | Fallback teks / ikon lokal |

---

## 11. Referensi Dokumen

- [TO-DO List](TODO.md) — backlog, prioritas, roadmap
- [SKILLS](SKILLS.md) — peta kemampuan kode & kiat pengembangan
- [Panduan Pengguna](BUKU-PANDUAN.md) — cara pakai halaman pembeli & admin
- [Panduan Developer](PANDUAN-DEVELOPER.md) — struktur kode & cara menyambungkan backend
