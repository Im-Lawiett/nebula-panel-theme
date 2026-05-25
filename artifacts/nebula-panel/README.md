# 🌌 Nebula Panel Theme

**Tema Pterodactyl gratis untuk semua** — dark cyberpunk, lengkap dengan fitur keamanan, chat publik, file manager, dan admin panel. Dibuat oleh [@RianModss](https://t.me/RianModss) buat dibagi-bagi ke yang ga mampu beli tema berbayar.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|-----------|
| 🌑 Dark Cyberpunk | Desain gelap modern mirip Pterodactyl |
| 📊 Dashboard Server | Kartu server dengan grafik CPU real-time (sparkline) |
| 🔒 Anti-Intip | User hanya bisa lihat server milik sendiri |
| 🚧 Maintenance Mode | Blokir semua user kecuali Owner (ID 1) |
| 🔨 Ban/Unban User | Banned user lihat halaman blokir otomatis |
| 📢 MOTD Banner | Pengumuman tampil di atas panel, bisa di-dismiss |
| ▶️ Quick Controls | Tombol Start/Stop/Restart langsung di kartu server |
| 💬 Public Chat | Chat antar user di panel |
| 📁 File Manager | Browse, edit, dan kelola file server |
| 👑 Super Owner | User ID 1 bypass SEMUA proteksi |
| 📋 Activity Log | Riwayat semua aktivitas admin & user |
| 🔑 SSH Keys | Kelola public key untuk akses SFTP |
| 🔽 Filter & Sort | Filter server by status, urutkan by nama/node/RAM |
| 📱 Responsive | Tampil bagus di HP maupun PC |

---

## 📋 Persyaratan Sebelum Install

Pastikan VPS kamu sudah punya ini:

- **Node.js 18+** — [cara install](https://nodejs.org)
- **PostgreSQL** — database untuk nyimpan data panel
- **Git** — untuk clone repo
- **pnpm** — package manager (lebih cepat dari npm)

> **Cek apakah sudah terinstall:**
> ```bash
> node --version     # harus v18 ke atas
> psql --version     # harus ada
> git --version      # harus ada
> pnpm --version     # harus ada
> ```

> **Belum ada pnpm?** Install dulu:
> ```bash
> npm install -g pnpm
> ```

---

## 🚀 Cara Install (Langkah per Langkah)

### Langkah 1 — Clone repo ke VPS kamu

```bash
git clone https://github.com/Im-Lawiett/nebula-panel-theme.git
cd nebula-panel-theme
```

### Langkah 2 — Install semua dependencies

```bash
pnpm install
```

> ⏳ Tunggu sampai selesai. Bisa 1-3 menit tergantung koneksi internet.

### Langkah 3 — Buat database PostgreSQL

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat database dan user baru (ganti password_kamu_disini sesuai keinginan)
CREATE DATABASE nebula_panel;
CREATE USER nebula_user WITH PASSWORD 'password_kamu_disini';
GRANT ALL PRIVILEGES ON DATABASE nebula_panel TO nebula_user;
\q
```

### Langkah 4 — Buat file konfigurasi

Buat file `.env` di folder root:

```bash
nano .env
```

Isi dengan ini (sesuaikan dengan database kamu di Langkah 3):

```env
DATABASE_URL=postgresql://nebula_user:password_kamu_disini@localhost:5432/nebula_panel
SESSION_SECRET=isi_dengan_string_acak_panjang_minimal_32_karakter
```

> 💡 **Tips generate SESSION_SECRET:**
> ```bash
> openssl rand -hex 32
> ```
> Copy hasilnya ke SESSION_SECRET.

### Langkah 5 — Buat tabel di database

```bash
pnpm --filter @workspace/db run push
```

> Perintah ini otomatis membuat semua tabel yang diperlukan. Harus berhasil tanpa error.

### Langkah 6 — Build semua aplikasi

```bash
pnpm run build
```

> ⏳ Proses build bisa 1-2 menit. Tunggu sampai muncul pesan sukses.

### Langkah 7 — Jalankan panel

Buka **2 terminal** (atau pakai screen/tmux), jalankan masing-masing:

**Terminal 1 — API Server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Web Panel:**
```bash
pnpm --filter @workspace/nebula-panel run dev
```

> 💡 **Atau jalankan keduanya sekaligus di background:**
> ```bash
> pnpm --filter @workspace/api-server run dev &
> pnpm --filter @workspace/nebula-panel run dev &
> ```

### Langkah 8 — Buka di browser

```
http://IP_VPS_KAMU:18246
```

Login dengan akun demo:

| Username | Password | Role |
|----------|----------|------|
| `dilzz`  | `demo`   | **Owner (ID 1)** — akses penuh |
| `jelen`  | `demo`   | User biasa |
| `pano`   | `demo`   | User biasa |

---

## 🔧 Cara Pakai Fitur Keamanan

### 👑 Owner Panel (ID 1)
- User dengan ID 1 adalah **pemilik panel — tidak bisa disentuh apapun**
- Tidak kena maintenance mode
- Tidak bisa dibanned
- Bisa lihat semua server milik siapapun
- Badge "OWNER" tampil di navbar
- Login sebagai `dilzz` untuk akses penuh

### 🚧 Maintenance Mode
1. Login sebagai Owner (dilzz)
2. Klik **Admin Control** di navbar kanan atas
3. Klik **Settings** di sidebar kiri
4. Toggle **Maintenance Mode** → ON
5. Isi pesan maintenance kalau mau (opsional)
6. Selesai — semua user langsung lihat halaman maintenance, hanya Owner yang bisa akses

> Matikan lagi dengan toggle yang sama → OFF

### 🔨 Ban User
1. Masuk ke **Admin Control → Users**
2. Cari user yang mau dibanned
3. Klik tombol merah **Ban** di sebelah kanan nama user
4. Isi alasan ban (opsional, tapi direkomendasikan)
5. Klik **Ban User**
6. User tersebut langsung tidak bisa akses panel — akan lihat halaman blokir dengan nama Telegram kamu

> Untuk unban: klik tombol hijau **Unban** di baris user yang sama

### 🔒 Anti-Intip Server
1. Masuk ke **Admin Control → Settings**
2. Toggle **Anti-Intip Server** → ON
3. Klik **Simpan**
4. Sekarang setiap user hanya bisa lihat server milik mereka sendiri
5. Owner tetap bisa lihat semua server

### 📢 Pengumuman (MOTD)
1. Masuk ke **Admin Control → Settings**
2. Toggle **Pengumuman (MOTD)** → ON
3. Isi teks pengumuman di kolom yang muncul
4. Klik **Simpan**
5. Banner pengumuman langsung tampil di atas panel untuk semua user
6. User bisa close/dismiss banner tersebut

### ▶️ Quick Server Controls
- Di halaman server list, arahkan kursor ke kartu server
- Tombol **Start / Stop / Restart** akan muncul otomatis
- Klik untuk langsung kontrol server tanpa masuk ke halaman detail

### 🔽 Filter & Sort Server
- Tab filter di atas daftar server: **Semua / Running / Starting / Stopped / Offline**
- Dropdown **Urut** di kanan: urutkan by Nama, Status, Node, atau RAM

---

## 🔄 Cara Update ke Versi Terbaru

```bash
# Masuk ke folder panel
cd nebula-panel-theme

# Ambil update terbaru dari GitHub
git pull origin main

# Install dependencies baru (kalau ada)
pnpm install

# Update database (kalau ada perubahan schema)
pnpm --filter @workspace/db run push

# Build ulang
pnpm run build

# Restart kedua server
```

---

## 🗑️ Cara Uninstall

```bash
# Hapus folder panel
rm -rf nebula-panel-theme

# Hapus database (HATI-HATI: data hilang permanen!)
sudo -u postgres psql -c "DROP DATABASE nebula_panel;"
sudo -u postgres psql -c "DROP USER nebula_user;"
```

---

## ❓ Troubleshooting

### ❌ "Cannot connect to database"
- Cek PostgreSQL berjalan: `sudo systemctl status postgresql`
- Pastikan format `DATABASE_URL` di `.env` benar
- Coba koneksi manual: `psql postgresql://nebula_user:password@localhost:5432/nebula_panel`

### ❌ "Port already in use"
```bash
# Cek siapa yang pakai port
sudo lsof -i :8080
sudo lsof -i :18246
# Matikan prosesnya
kill -9 [PID]
```

### ❌ "pnpm: command not found"
```bash
npm install -g pnpm
```

### ❌ Panel tidak bisa dibuka di browser
```bash
# Izinkan port di firewall
sudo ufw allow 18246
sudo ufw allow 8080
sudo ufw reload
```

### ❌ Error saat "pnpm run build"
```bash
# Coba hapus node_modules dan install ulang
rm -rf node_modules
pnpm install
pnpm run build
```

### ❌ Lupa password database
```bash
# Reset password di PostgreSQL
sudo -u postgres psql -c "ALTER USER nebula_user PASSWORD 'password_baru';"
# Update juga di file .env
```

---

## 📁 Struktur Folder

```
nebula-panel-theme/
├── artifacts/
│   ├── api-server/          # Backend Express API (port 8080)
│   │   └── src/routes/      # Semua endpoint API
│   └── nebula-panel/        # Frontend React + Vite (port 18246)
│       └── src/
│           ├── pages/       # Halaman-halaman panel
│           ├── components/  # Komponen UI reusable
│           └── lib/         # Hooks dan utilities
├── lib/
│   ├── db/                  # Schema database (Drizzle ORM)
│   └── api-spec/            # OpenAPI spec + codegen
└── scripts/                 # Script utility
```

---

## 🛠️ Perintah Berguna

```bash
# Jalankan hanya API server
pnpm --filter @workspace/api-server run dev

# Jalankan hanya web panel
pnpm --filter @workspace/nebula-panel run dev

# Cek error TypeScript
pnpm run typecheck

# Regenerate API hooks (setelah ubah OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen

# Push perubahan schema database
pnpm --filter @workspace/db run push
```

---

## 👨‍💻 Tentang Developer

Tema ini dibuat oleh **RianModss** dan **GRATIS** untuk siapapun yang mau pakai, dibagikan, dan dimodifikasi.

Mau tanya-tanya, lapor bug, atau sekadar bilang terima kasih? Hubungi:

- **Telegram:** [@RianModss](https://t.me/RianModss)
- **GitHub:** [Im-Lawiett/nebula-panel-theme](https://github.com/Im-Lawiett/nebula-panel-theme)

> *"Dibuat buat yang ga mampu beli tema keamanan panel Pterodactyl yang sering dijual mahal-mahal. Semoga bermanfaat dan bisa membantu!"* — RianModss

---

## 📄 Lisensi

MIT License — bebas dipakai, dimodifikasi, dan disebarkan.
Tolong jangan hapus credit developernya ya, biar makin banyak yang tau dan bisa ikut dapat manfaatnya! 🙏
