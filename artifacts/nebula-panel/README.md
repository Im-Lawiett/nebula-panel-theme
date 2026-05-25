# Nebula Panel Theme

Tema kustom untuk **Pterodactyl Panel** dengan tampilan dark cyberpunk / deep-space.

**Developer:** RianModss &nbsp;|&nbsp; **Telegram:** [@RianModss](https://t.me/RianModss)

---

## Fitur Utama

- Tampilan gelap cyberpunk dengan aksen cyan / biru
- Daftar server dengan grafik statistik CPU/RAM/Disk naik-turun
- File manager lengkap (rename, pindah, permissions, zip, unzip, hapus)
- Chat publik real-time dengan semua user panel
- Panel admin lengkap: Overview, Server, Node, User, Lokasi, Nests/Eggs, API Key
- **Maintenance Mode** — matikan akses semua user dengan satu klik
- **Ban/Unban User** — blokir user nakal langsung dari panel
- **Anti-Intip Server** — user hanya bisa lihat server milik sendiri
- **Owner Protection** — user ID 1 tidak kena batasan apapun (owner panel)

---

## Cara Install di Pterodactyl

> **Syarat:** Pterodactyl Panel sudah terpasang di server kamu, biasanya di `/var/www/pterodactyl`

---

### Metode 1 — Auto Install (Paling Mudah)

Cukup jalankan 1 perintah ini di terminal server kamu:

```bash
cd /var/www/pterodactyl && bash <(curl -sSL https://raw.githubusercontent.com/Im-Lawiett/nebula-panel-theme/main/install.sh)
```

Script akan otomatis:
1. Backup tema asli
2. Download tema Nebula
3. Copy file tema
4. Build aset
5. Bersihkan cache

---

### Metode 2 — Install Manual (Step by Step)

Ikuti langkah-langkah berikut satu per satu:

**Langkah 1 — Masuk ke folder panel**
```bash
cd /var/www/pterodactyl
```

**Langkah 2 — Backup tema asli dulu (wajib!)**
```bash
cp -r resources/scripts resources/scripts.bak
```

**Langkah 3 — Download tema Nebula**
```bash
git clone https://github.com/Im-Lawiett/nebula-panel-theme /tmp/nebula-theme
```

**Langkah 4 — Copy file tema ke panel**
```bash
cp -rf /tmp/nebula-theme/pterodactyl/resources/scripts/* resources/scripts/
```

**Langkah 5 — Install dependensi (jalankan hanya sekali)**
```bash
composer install --no-dev --optimize-autoloader
yarn install --frozen-lockfile
```

**Langkah 6 — Build tema**
```bash
yarn build:production
```

**Langkah 7 — Bersihkan cache**
```bash
php artisan optimize:clear
php artisan config:clear
php artisan view:clear
```

**Langkah 8 — Selesai!** Buka panel kamu di browser, tema Nebula sudah aktif.

---

### Cara Uninstall / Kembalikan ke Tema Asli

```bash
cd /var/www/pterodactyl
cp -rf resources/scripts.bak/* resources/scripts/
yarn build:production
php artisan optimize:clear
echo "Tema asli berhasil dikembalikan!"
```

---

## Panduan Fitur Keamanan

### Owner Panel (ID 1)
User dengan ID 1 adalah pemilik panel dan **tidak terkena batasan apapun**. Maintenance mode, anti-intip, dan ban tidak berlaku untuk owner.

### Maintenance Mode
- Pergi ke **Admin > Settings**
- Toggle **Maintenance Mode** ON
- Semua user akan melihat halaman "Server sedang Maintenance"
- Kamu (owner ID 1) tetap bisa akses panel seperti biasa

### Ban User
- Pergi ke **Admin > Users**
- Klik ikon ban (merah) di sebelah kanan nama user
- Masukkan alasan ban
- User yang di-ban akan melihat halaman "Anda telah di ban"
- Untuk unban: klik ikon unban (hijau) di baris user yang sama

### Anti-Intip Server
- Pergi ke **Admin > Settings**
- Toggle **Anti-Intip Server** ON
- Setiap user hanya bisa melihat server milik mereka sendiri
- Owner panel (ID 1) tetap bisa lihat semua server

---

## Troubleshooting

**Panel tidak berubah setelah install?**
```bash
cd /var/www/pterodactyl
yarn build:production
php artisan optimize:clear
```
Lalu hard refresh browser: `Ctrl + Shift + R`

**Error saat `yarn build`?**
```bash
cd /var/www/pterodactyl
rm -rf node_modules
yarn install --frozen-lockfile
yarn build:production
```

**File tidak ditemukan saat install?**
Pastikan Pterodactyl sudah terinstall di `/var/www/pterodactyl`. Cek dengan:
```bash
ls /var/www/pterodactyl
```

---

## Lisensi

MIT License — Bebas digunakan dan didistribusikan.

---

*Developer: RianModss &nbsp;|&nbsp; Telegram: [@RianModss](https://t.me/RianModss)*
