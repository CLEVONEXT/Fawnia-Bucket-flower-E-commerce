/* ============================================================
   js/config.js — Konfigurasi & konstanta global Fawnia
   Berisi: kunci localStorage, opsi pengiriman, opsi pembayaran,
   status pesanan, nama file gambar, dan konten default.
   ============================================================ */

const FAWNIA_KEYS = {
  products: "fawnia_products",
  gallery: "fawnia_gallery",
  testimonials: "fawnia_testimonials",
  orders: "fawnia_orders",
  settings: "fawnia_settings",
  admin: "fawnia_admin",
  session: "fawnia_session",
  users: "fawnia_users",
};

/* ---------- Nama file gambar ----------
   Ganti file PNG di folder assets/img/ dengan nama yang sama. */
const FAWNIA_IMAGES = {
  logo: "assets/img/fawnia-logo.png",
  hero: "assets/img/hero.png",
  products: {
    "Bucket Wisuda": "assets/img/bucket-1.png",
    "Bucket Sweet": "assets/img/bucket-2.png",
    "Bucket Custom": "assets/img/bucket-3.png",
    "Gift Mini": "assets/img/bucket-4.png",
    "Bucket Bunga Kering": "assets/img/bucket-5.png",
    "Bucket Snack & Cake": "assets/img/bucket-6.png",
  },
  gallery: [
    "assets/img/galeri-1.png",
    "assets/img/galeri-2.png",
    "assets/img/galeri-3.png",
    "assets/img/galeri-4.png",
    "assets/img/galeri-5.png",
    "assets/img/galeri-6.png",
  ],
};

/* ---------- Metode pengiriman ---------- */
const FAWNIA_SHIPPING = [
  {
    id: "pickup",
    label: "Ambil di Toko",
    note: "Gratis, siap dalam 1 hari",
    cost: 0,
  },
  {
    id: "kurir-lokal",
    label: "Kurir Lokal (Bandung)",
    note: "Estimasi 1 hari",
    cost: 15000,
  },
  {
    id: "instant",
    label: "Instant / GoSend",
    note: "Tiba di hari yang sama",
    cost: 25000,
  },
  { id: "jne", label: "JNE Reguler", note: "Estimasi 2-4 hari", cost: 20000 },
  { id: "jnt", label: "J&T Express", note: "Estimasi 2-4 hari", cost: 18000 },
  {
    id: "sicepat",
    label: "SiCepat Halu",
    note: "Estimasi 2-3 hari",
    cost: 19000,
  },
];

/* ---------- Metode pembayaran ---------- */
const FAWNIA_PAYMENTS = [
  {
    id: "transfer-bca",
    label: "Transfer BCA",
    note: "Transfer ke rekening toko",
  },
  {
    id: "transfer-mandiri",
    label: "Transfer Mandiri",
    note: "Transfer ke rekening toko",
  },
  { id: "qris", label: "QRIS", note: "Scan dari semua e-wallet" },
  { id: "gopay", label: "GoPay", note: "Bayar lewat aplikasi Gojek" },
  { id: "shopeepay", label: "ShopeePay", note: "Bayar lewat Shopee" },
  { id: "dana", label: "DANA", note: "Bayar lewat aplikasi DANA" },
  { id: "cod", label: "COD (Bayar di Tempat)", note: "Khusus area tertentu" },
];

/* ---------- Status pesanan (alur seperti marketplace) ----------
   Belum Bayar -> Dikemas -> Dikirim -> Selesai */
const FAWNIA_ORDER_STATUS = [
  "Baru",        // = Belum Bayar (menunggu pembayaran)
  "Diproses",    // = Dikemas (sudah dibayar)
  "Dikirim",     // = Dikirim (ada nomor resi)
  "Selesai",     // = Selesai (diterima pembeli)
  "Dibatalkan",
];

/* Status yang dilihat pembeli di halaman Akun */
const FAWNIA_USER_TABS = [
  { id: "belum-bayar", label: "Belum Bayar", statuses: ["Baru"] },
  { id: "dikemas", label: "Dikemas", statuses: ["Diproses"] },
  { id: "dikirim", label: "Dikirim", statuses: ["Dikirim"] },
  { id: "selesai", label: "Selesai", statuses: ["Selesai"] },
];

/* ---------- Konten default ---------- */
const FAWNIA_DEFAULTS = {
  settings: {
    businessName: "Fawnia",
    tagline: "Bucket & gift untuk momen spesial.",
    whatsapp: "6281234567890",
    instagram: "@fawnia",
    email: "hello@fawnia.com",
    address: "Jl. Melati No. 12, Kota Bandung",
    shippingNote: "Pengiriman dihitung dari alamat toko.",
    bankAccount: "BCA 1234567890 a.n. Fawnia",
    qrisNote: "Scan QRIS pada kode toko, lalu unggah bukti pembayaran.",
  },
  products: [
    {
      id: 1,
      name: "Bucket Wisuda",
      price: 100000,
      description:
        "Bucket spesial untuk hadiah wisuda. Bisa disesuaikan dengan warna dan tema yang diinginkan.",
      label: "WISUDA",
      image: FAWNIA_IMAGES.products["Bucket Wisuda"],
      stock: 12,
      status: "Aktif",
    },
    {
      id: 2,
      name: "Bucket Sweet",
      price: 85000,
      description:
        "Pilihan manis untuk memberikan kejutan kepada orang tersayang.",
      label: "SWEET",
      image: FAWNIA_IMAGES.products["Bucket Sweet"],
      stock: 9,
      status: "Aktif",
    },
    {
      id: 3,
      name: "Bucket Custom",
      price: 125000,
      description:
        "Bucket custom yang dapat disesuaikan dengan isi dan tema pilihan pelanggan.",
      label: "CUSTOM",
      image: FAWNIA_IMAGES.products["Bucket Custom"],
      stock: 7,
      status: "Aktif",
    },
    {
      id: 4,
      name: "Gift Mini",
      price: 65000,
      description: "Gift sederhana untuk kejutan kecil yang tetap berkesan.",
      label: "GIFT",
      image: FAWNIA_IMAGES.products["Gift Mini"],
      stock: 15,
      status: "Aktif",
    },
    {
      id: 5,
      name: "Bucket Bunga Kering",
      price: 155000,
      description: "Bucket bunga kering elegan yang tahan lama untuk dekorasi ruangan.",
      label: "FLOWERS",
      image: FAWNIA_IMAGES.products["Bucket Bunga Kering"],
      stock: 5,
      status: "Aktif",
    },
    {
      id: 6,
      name: "Bucket Snack & Cake",
      price: 145000,
      description:
        "Kombinasi snack pilihan dan cake mini, cocok untuk surprise ulang tahun.",
      label: "HAMPER",
      image: FAWNIA_IMAGES.products["Bucket Snack & Cake"],
      stock: 6,
      status: "Aktif",
    },
  ],
  gallery: [
    {
      id: 1,
      title: "Bucket Wisuda Lilac",
      image: FAWNIA_IMAGES.gallery[0],
      visible: true,
    },
    {
      id: 2,
      title: "Sweet Surprise",
      image: FAWNIA_IMAGES.gallery[1],
      visible: true,
    },
    {
      id: 3,
      title: "Custom Request",
      image: FAWNIA_IMAGES.gallery[2],
      visible: true,
    },
    {
      id: 4,
      title: "Gift Mini Box",
      image: FAWNIA_IMAGES.gallery[3],
      visible: true,
    },
    {
      id: 5,
      title: "Wedding Bucket",
      image: FAWNIA_IMAGES.gallery[4],
      visible: true,
    },
    {
      id: 6,
      title: "Anniversary Set",
      image: FAWNIA_IMAGES.gallery[5],
      visible: true,
    },
  ],
  testimonials: [
    {
      id: 1,
      name: "Alya",
      text: "Bucket-nya rapi dan cantik. Cocok banget buat hadiah!",
      rating: 5,
      visible: true,
    },
    {
      id: 2,
      name: "Nadia",
      text: "Request custom saya sesuai dan prosesnya juga cepat.",
      rating: 5,
      visible: true,
    },
    {
      id: 3,
      name: "Raka",
      text: "Packaging bagus, penerima hadiahnya suka banget.",
      rating: 5,
      visible: true,
    },
  ],
};

window.FAWNIA_KEYS = FAWNIA_KEYS;
window.FAWNIA_IMAGES = FAWNIA_IMAGES;
window.FAWNIA_SHIPPING = FAWNIA_SHIPPING;
window.FAWNIA_PAYMENTS = FAWNIA_PAYMENTS;
window.FAWNIA_ORDER_STATUS = FAWNIA_ORDER_STATUS;
window.FAWNIA_USER_TABS = FAWNIA_USER_TABS;
window.FAWNIA_DEFAULTS = FAWNIA_DEFAULTS;
