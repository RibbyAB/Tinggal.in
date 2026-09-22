# Tinggal.in

Sistem manajemen kost berbasis Laravel — pengelolaan kamar, penghuni, sewa,
tagihan, pembayaran, dan komplain, dengan tiga peran pengguna: Owner, Admin,
dan Tenant.

Dibuat untuk mata kuliah Web Programming, BINUS University.

## Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Laravel 12 (PHP 8.2+) |
| Database | MySQL + Eloquent ORM |
| Tampilan | Blade + Tailwind CSS (Play CDN) |
| Interaksi | Alpine.js |
| Grafik | Chart.js |
| Autentikasi | Session-based (`Auth` facade) |

Tidak ada build step. Tailwind, Alpine, dan Chart.js dimuat lewat CDN, jadi
tidak perlu `npm install` maupun `npm run build`.

## Cara menjalankan

```bash
git clone <url-repo-ini>
cd tinggal-in

composer install
cp .env.example .env
php artisan key:generate
```

Buat database kosong di MySQL, lalu sesuaikan `.env`:

```env
APP_NAME=Tinggal.in

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tinggalin
DB_USERNAME=root
DB_PASSWORD=
```

Kemudian:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Buka `http://localhost:8000`.

`storage:link` wajib dijalankan — bukti pembayaran yang diupload tenant
disimpan di `storage/app/public/payments` dan diakses lewat `/storage/...`.

## Akun demo

Password untuk semua akun: `password123`

| Role | Email |
|---|---|
| Owner | `owner@tinggal.in` |
| Admin | `admin@tinggal.in` |
| Tenant | `tenant@tinggal.in` |

Seeder mengisi 18 kamar, 13 penghuni, sewa aktif, tagihan 3 bulan terakhir,
pembayaran, dan komplain. Untuk mengulang dari nol:

```bash
php artisan migrate:fresh --seed
```

## Hak akses

| Fitur | Owner | Admin | Tenant |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Kelola kamar / penghuni / sewa | ✅ | ✅ | ❌ |
| Generate tagihan | ✅ | ✅ | ❌ |
| Lihat pembayaran | ✅ | ✅ | milik sendiri |
| **Approve / reject pembayaran** | ✅ | ❌ | ❌ |
| **Laporan pendapatan** | ✅ | ❌ | ❌ |
| Upload bukti bayar | ❌ | ❌ | ✅ |
| Komplain | lihat + ubah status | lihat + ubah status | buat + lihat milik sendiri |
| **Activity log** | ✅ | ❌ | ❌ |

Admin tidak bisa approve/reject pembayaran karena dana ditransfer langsung ke
rekening Owner, sehingga hanya Owner yang dapat memastikan uangnya benar-benar
masuk. Route `approve` dan `reject` tidak didaftarkan sama sekali di grup
`/admin` (lihat `routes/web.php`) — jadi bukan sekadar tombolnya disembunyikan.
Admin juga tidak memiliki akses ke laporan pendapatan agregat maupun activity
log — jejak audit siapa melakukan apa hanya dapat dilihat Owner.

## Aturan bisnis

- Status kamar hanya dapat diubah manual ke `AVAILABLE` atau `MAINTENANCE`.
  `OCCUPIED` ditetapkan otomatis saat kamar terisi penuh sesuai kapasitas.
- Kamar yang masih memiliki sewa aktif tidak dapat diubah statusnya — penghuni
  harus di-checkout terlebih dahulu. Berlaku dua arah, termasuk ke
  `MAINTENANCE`.
- Satu tagihan hanya boleh dibuat sekali per sewa per bulan, dijaga oleh unique
  constraint di level database.
- Harga sewa disimpan sebagai snapshot di `rentals.monthly_price` saat check-in,
  sehingga perubahan harga kamar tidak mengubah tagihan yang sudah terbit.
- Bukti bayar tidak dapat diupload dua kali selama masih ada pembayaran
  berstatus `PENDING` untuk tagihan yang sama.
- Saat pembayaran ditolak, status tagihan dihitung ulang berdasarkan riwayat
  pembayaran dan tanggal jatuh tempo (`PAID` / `PENDING_VERIFICATION` /
  `OVERDUE` / `UNPAID`), bukan dikembalikan begitu saja ke `UNPAID`.
- `tenant_id` selalu diturunkan dari session melalui middleware `tenant.scope`
  dan tidak pernah diambil dari input pengguna, sehingga penghuni tidak dapat
  mengakses data penghuni lain dengan menebak URL.

## Struktur

```
app/
  Http/Controllers/     controller tipis — validasi, panggil service, redirect
  Http/Middleware/      EnsureUserHasRole, EnsureUserIsActive, AttachTenantId
  Http/Requests/        form request untuk validasi input
  Models/               9 model Eloquent
  Services/             seluruh logika bisnis
  Support/Money.php     helper format rupiah
  Exceptions/           AppException
database/migrations/    9 tabel
database/seeders/       data demo
resources/views/
  layouts/              app (sidebar + navbar) dan guest (login)
  components/           panel, stat-card, status-badge
  partials/             sidebar, navbar, icons
  errors/               halaman error aplikasi
  owner/ admin/ tenant/ dashboard per peran
  rooms/ tenants/ rentals/ bills/ payments/ complaints/ activity-logs/
routes/web.php
bootstrap/app.php       alias middleware dan handler AppException
```

Logika bisnis sengaja dipusatkan di `app/Services` agar setiap aturan hanya
ditulis di satu tempat, sementara controller hanya menangani request dan
response.

## Troubleshooting

**`Target class [role] does not exist`** — alias middleware belum terdaftar,
periksa `bootstrap/app.php`.

**Bukti pembayaran tidak tampil / 404** — `php artisan storage:link` belum
dijalankan.

**Halaman tampil tanpa warna** — Tailwind dimuat dari CDN, jadi perlu koneksi
internet saat halaman dibuka.

**`SQLSTATE[HY000] [1049] Unknown database`** — database pada `.env` belum
dibuat di MySQL.

Setelah mengubah `.env`, jalankan `php artisan config:clear`.