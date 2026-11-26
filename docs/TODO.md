# TO-DO List — Fawnia Website (Vanilla)

Status saat ini: **MVP demo jalan** (landing, keranjang, checkout, struk, akun pembeli, panel admin).
Dokumen ini memetakan pekerjaan tersisa: perbaikan, peningkatan UX, dan jalur menuju production.

Legenda status: ✅ selesai · 🔄 sedang berjalan · ⬜ belum · ⏸ ditunda
Legenda prioritas: **P1** wajib · **P2** penting · **P3** nice to have

---

## 0. Ringkasan Progres

| Area | Status | Catatan |
| --- | --- | --- |
| Landing page & pencarian | ✅ | grid produk, galeri, testimoni, pengiriman, pembayaran |
| Keranjang + drawer + badge | ✅ | localStorage, sinkron antar-tab |
| Checkout website + WA | ✅ | validasi dasar, ringkasan biaya otomatis |
| Struk + QR demo + cetak | ✅ | QR dibuat tanpa library (`js/qr.js`) |
| Akun pembeli (daftar/login/profil) | ✅ | demo localStorage |
| Riwayat pesanan + tab status | ✅ | Bayar/Batalkan/Diterima/Lacak |
| Lacak pengiriman, CS, Pusat Bantuan | ✅ | data statis + data pesanan |
| Panel admin (8 halaman) | ✅ | CRUD localStorage |
| Inbox pesan (`fawnia_messages`) | ✅ | tombol balas WA |
| Backend / database | ⬜ | masih prototype |
| Pembayaran online asli | ⬜ | masih QR demo |
| Komentar kode berbahasa Indonesia | ✅ | seluruh `js/`, `css/`, komentar HTML |
| Dokumentasi (PRD, TODO, SKILLS, panduan) | ✅ | folder `docs/` |

---

## 1. Bug & Perbaikan Cepat (Quick Wins)

| # | Tugas | Prioritas | File terkait |
| --- | --- | --- | --- |
| 1.1 | Perbaiki teks rusak di `README.md` (baris 69–70 berisi encoding aneh “F a w n i a - B u c k e t…”) | P2 | `README.md` |
| 1.2 | Rapikan indentasi ganjil di `js/pages/account.js` (`editProfile`: `FawniaUI.openModal` menjorok berlebih) | P3 | `js/pages/account.js` |
| 1.3 | Pastikan tombol `Bayar Sekarang` di halaman Akun mengarah ke URL struk yang sama dengan checkout | P2 | `js/pages/account.js` |
| 1.4 | Tambahkan urutan `js/auth-user.js` yang eksplisit di dokumentasi setiap halaman (halaman akun & checkout) | P3 | `pages/*.html` |
| 1.5 | Cek duplikasi fungsi `FawniaUIField` (tidak terpakai) vs `FawniaUI.field`; hapus atau gunakan | P3 | `js/pages/account.js`, `js/ui.js` |
| 1.6 | Kurangi `console` noise / tambahkan handler error global saat demo | P3 | `js/main.js` |
| 1.7 | Normalisasi nomor WA di semua titik (settings, orders, messages) memakai `FawniaUtils.waNumber` | P2 | `js/utils.js`, admin |
| 1.8 | Validasi email sederhana di form daftar akun | P2 | `js/pages/account.js` |
| 1.9 | Cegah item keranjang melebihi stok produk | P2 | `js/cart.js` |
| 1.10 | Foto di `assets/img/README.txt` — pastikan semua nama file sesuai `FAWNIA_IMAGES` | P3 | `assets/img/` |

---

## 2. Katalog & Halaman Publik

| # | Tugas | Prioritas | Catatan implementasi |
| --- | --- | --- | --- |
| 2.1 | Filter kategori (bucket, gift, hamper) di landing | P2 | perlu field `category` di produk + tombol filter di `#products` |
| 2.2 | Urutkan produk (termurah, termahal, terbaru, stok terbatas) | P2 | `select` di section-head → `products.js` |
| 2.3 | Pagination atau “Muat lebih banyak” saat produk > 12 | P3 | state di `FawniaProductsSection` |
| 2.4 | Rating & jumlah ulasan diambil dari testimoni yang terkait produk | P3 | tambah `productId` di testimoni |
| 2.5 | Galeri produk (multi-gambar) pada detail produk | P3 | array `images[]` + thumbnail |
| 2.6 | Form kontak di landing yang menulis ke `fawnia_messages` | P2 | id `name/phone/message`, `createdAt` |
| 2.7 | Tampilkan badge “Promo” / harga coret | P3 | field `priceOriginal` |
| 2.8 | SEO dasar: meta OG, `sitemap`, `canonical` | P2 | per halaman |
| 2.9 | Skeletons/loading state saat render produk | P3 | placeholder kartu |

## 3. Keranjang & Checkout

| # | Tugas | Prioritas | Catatan |
| --- | --- | --- | --- |
| 3.1 | Kurangi stok produk otomatis setelah pesanan dibuat | P2 | `FawniaStore.saveProduct` + `FawniaCart` |
| 3.2 | Simpan alamat & nomor WA terakhir dari profil, isi otomatis di form checkout | P2 | `FawniaUserAuth.current()` |
| 3.3 | Kode promo / voucher (persen & nominal) | P2 | field `voucher` di pesanan |
| 3.4 | Ongkir berdasarkan alamat (API RajaOngkir/lokal) | P3 | butuh backend perantara CORS |
| 3.5 | Ekspor pesanan CSV dari panel admin | P2 | `Blob` + `a.download` |
| 3.6 | Cetak struk: CSS print khusus (A5 / 58 mm thermal) | P3 | `@media print` |
| 3.7 | Ganti QR demo dengan QRIS asli (gambar statis dari toko) | P1 | `js/sections/checkout.js` |
| 3.8 | Upload bukti transfer di halaman struk | P2 | butuh storage |

## 4. Akun Pembeli

| # | Tugas | Prioritas | Catatan |
| --- | --- | --- | --- |
| 4.1 | Alamat tersimpan (multiple address) | P3 | array `addresses` |
| 4.2 | Notifikasi/ikon saat ada pesanan baru dikirim | P3 | polling `storage` |
| 4.3 | Form ulasan setelah pesanan `Selesai` (tulis ke testimoni) | P2 | status pesanan → `reviewed` |
| 4.4 | Lupa password (demo: reset lokal) | P3 | hanya edukasi |
| 4.5 | Halaman detail pesanan terpisah dengan timeline lengkap | P3 | halaman baru `pages/order-detail.html` |
| 4.6 | Lacak pengiriman: nomor resi otomatis dari input admin | P2 | field `resi` di pesanan |

## 5. Panel Admin

| # | Tugas | Prioritas | Catatan |
| --- | --- | --- | --- |
| 5.1 | Input nomor resi di kartu pesanan (mendukung halaman Lacak) | P1 | `js/admin/orders.js` |
| 5.2 | Tombol “Tandai sudah dibayar” (Baru → Diproses) sekali klik | P2 | status flow |
| 5.3 | Grafik omzet 7 hari / 30 hari | P3 | SVG sederhana tanpa library |
| 5.4 | Unggah foto: kompresi ke ≤ 400 KB sebelum disimpan | P2 | canvas resize sebelum data URL |
| 5.5 | Manajemen kategori & label produk dari Pengaturan | P3 | konfigurasi |
| 5.6 | Ekspor & impor data JSON (backup/restore `localStorage`) | P1 | lihat 6.3 |
| 5.7 | Ganti status pesanan sekaligus (bulk) | P3 | checkbox |
| 5.8 | Panel pesan: pisahkan “sudah dibalas” vs “baru” | P3 | field `replied` |
| 5.9 | Ubah biaya pengiriman dari panel admin (saat ini statis di config) | P2 | `fawnia_settings.shipping[]` |

---

## 6. Jalur Production (Backend)

| # | Tugas | Prioritas | Catatan |
| --- | --- | --- | --- |
| 6.1 | Pilih stack backend (PHP/MySQL, Supabase, Firebase) | P1 | struktur `store.js` sudah jadi pintu tunggal |
| 6.2 | Ganti `FawniaStore` menjadi panggilan API (`fetch`) dengan nama fungsi sama | P1 | minim ubah UI |
| 6.3 | Autentikasi admin di server + sesi/token (bukan `localStorage "true"`) | P1 | `js/admin/auth.js` |
| 6.4 | Autentikasi pembeli + hash password (bcrypt/argon2) | P1 | `js/auth-user.js` |
| 6.5 | Storage gambar (Supabase Storage / S3) + CDN | P1 | ganti data URL |
| 6.6 | Payment gateway (Midtrans/Xendit) atau QRIS dinamis | P1 | webhook status |
| 6.7 | Webhook/notifikasi WhatsApp (WA Business API) | P2 | alternatif `wa.me` |
| 6.8 | Halaman 404 kustom & error boundary | P3 | `pages/404.html` |

---

## 7. Kualitas, QA, & Dokumentasi

| # | Tugas | Prioritas | Catatan |
| --- | --- | --- | --- |
| 7.1 | Jalankan audit mobile (390 px) untuk semua halaman via browser | P1 | gunakan skill `browser-automation` |
| 7.2 | Cek konsol error di semua halaman | P1 | gambar hilang & lucide CDN |
| 7.3 | Uji flow: keranjang → checkout → struk → admin ubah status → Akun → Selesai | P1 | skenario end-to-end |
| 7.4 | Uji `Escape` menutup drawer/modal/lightbox | P2 | aksesibilitas |
| 7.5 | Tambah `tests/` skrip sederhana (opsional Playwright) untuk smoke test | P3 | folder `.qa/` sudah ada |
| 7.6 | Jaga komentar dalam Bahasa Indonesia saat menambah kode baru | P2 | konvensi |
| 7.7 | Perbarui `docs/` saat ada fitur baru | P2 | — |

---

## 8. Roadmap (Saran Urutan)

**Sprint 1 — Pembersihan & Verifikasi (1–2 hari)**
- Item 1.1, 1.3, 1.7, 1.9, 3.1
- Item 7.1–7.3 (QA via browser)

**Sprint 2 — Membuat Demo Terasa Nyata (3–5 hari)**
- 3.7 (QRIS asli), 5.1 (resi), 5.2 (tandai dibayar), 2.6 (form kontak), 3.5 (ekspor CSV), 4.3 (ulasan)

**Sprint 3 — Fondasi Backend (1–2 minggu)**
- 6.1–6.6, 5.6 (impor/ekspor)

**Backlog lanjutan**
- Voucher, ongkir API, multi-alamat, grafik omzet, WhatsApp API, 404

---

## 9. Checklist Rilis Demo ke Klien

- [x] Landing, produk, galeri, testimoni rapi di desktop & mobile
- [x] Keranjang & checkout jalan
- [x] Struk + QR demo + cetak
- [x] Akun pembeli (daftar, login, profil, riwayat)
- [x] Panel admin login, CRUD, ubah status pesanan
- [x] Pengaturan toko + reset data
- [x] Komentar kode Bahasa Indonesia
- [x] Dokumentasi lengkap (`docs/`)
- [ ] Tautan admin di footer disembunyikan dari publik (opsional: `data-admin-trigger` 3× sudah dipakai)
- [ ] Data demo dikosongkan sebelum serah terima (Pengaturan → Reset)
