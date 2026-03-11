# 📱 CariHP.id — Panduan Setup untuk Pemula

Halo! Panduan ini ditulis khusus untuk kamu yang **belum pernah coding** sebelumnya.
Setiap langkah dijelaskan dengan detail. Ikuti satu per satu dari atas ke bawah ya!

> ⏱️ **Estimasi waktu:** 30–60 menit untuk pertama kali setup

---

## 📋 DAFTAR ISI

1. [Yang Kamu Butuhkan](#yang-kamu-butuhkan)
2. [Langkah 1 — Install Node.js](#langkah-1--install-nodejs)
3. [Langkah 2 — Setup Supabase (Database)](#langkah-2--setup-supabase-database)
4. [Langkah 3 — Setup RapidAPI](#langkah-3--setup-rapidapi)
5. [Langkah 4 — Setup Groq (AI)](#langkah-4--setup-groq-ai)
6. [Langkah 5 — Setup Resend (Email)](#langkah-5--setup-resend-email)
7. [Langkah 6 — Jalankan Website](#langkah-6--jalankan-website)
8. [Cara Pakai Website](#cara-pakai-website)
9. [Cara Pakai Admin Panel](#cara-pakai-admin-panel)
10. [Upload ke Internet](#upload-ke-internet-opsional)
11. [Kalau Ada Error](#kalau-ada-error)

---

## Yang Kamu Butuhkan

Sebelum mulai, siapkan:
- ✅ Laptop/komputer (Windows atau Mac)
- ✅ Koneksi internet
- ✅ Email aktif
- ✅ **Notepad/aplikasi catatan** — untuk menyimpan password & API key sementara

Semua layanan yang dipakai **GRATIS**.

---

## LANGKAH 1 — Install Node.js

> **Apa itu Node.js?**
> Bayangkan Node.js seperti "mesin" yang dibutuhkan laptop kamu untuk bisa menjalankan website ini. Tanpa ini, website tidak bisa jalan.

### Cara Install:

**1.** Buka browser, ketik di address bar: `https://nodejs.org` lalu tekan Enter

**2.** Kamu akan lihat tampilan seperti ini:
```
┌─────────────────────────────────────┐
│  [ Download 20.x.x LTS ]  [ 22.x ]  │
│   Recommended for most users         │
└─────────────────────────────────────┘
```

**3.** Klik tombol **"Download Node.js (LTS)"** — yang ada tulisan *Recommended for most users*

**4.** File installer akan terdownload (± 30MB). Tunggu sampai selesai.

**5.** Buka file yang terdownload:
- File biasanya ada di folder **Downloads**
- **Windows:** file berekstensi `.msi`, klik dua kali → klik **Next** terus → klik **Finish**
- **Mac:** file berekstensi `.pkg`, klik dua kali → klik **Continue** terus → klik **Close**

**6.** Setelah selesai, **restart laptop kamu** (ini penting!)

### Cek Apakah Berhasil:

Setelah restart, buka **Terminal** atau **Command Prompt**:

- **Windows:** tekan tombol `⊞ Windows + R` di keyboard → muncul kotak kecil → ketik `cmd` → klik OK
- **Mac:** tekan `⌘ Command + Spasi` → muncul Spotlight → ketik `Terminal` → tekan Enter

Setelah Terminal/Command Prompt terbuka, ketik perintah ini **persis** lalu tekan Enter:
```
node --version
```

Kalau berhasil, akan muncul angka seperti:
```
v20.18.0
```

✅ **Kalau muncul angka → Node.js berhasil terinstall!**

❌ **Kalau muncul error** → coba restart laptop lagi, lalu ulangi cek. Kalau masih error, install ulang Node.js.

---

## LANGKAH 2 — Setup Supabase (Database)

> **Apa itu Supabase?**
> Ini adalah tempat menyimpan semua data website kamu — data HP, watchlist user, dll. Bayangkan seperti Google Sheets tapi lebih canggih dan aman. Gratis.

### 2A — Buat Akun Supabase

**1.** Buka `https://supabase.com`

**2.** Klik tombol **"Start your project"** (warna hijau)

**3.** Klik **"Sign Up"**

**4.** Pilih **"Continue with GitHub"**
- Kalau belum punya akun GitHub, buat dulu di `https://github.com` (gratis, pakai email)
- GitHub adalah platform menyimpan kode — nanti juga dibutuhkan untuk upload website

**5.** Ikuti proses login GitHub → izinkan Supabase mengakses akun GitHub kamu

**6.** Setelah berhasil, kamu akan masuk ke **Dashboard Supabase** ✅

---

### 2B — Buat Project Baru

**1.** Di dashboard Supabase, klik tombol **"New Project"**

**2.** Isi form yang muncul:

| Kolom | Isi dengan |
|-------|-----------|
| **Organization** | Pilih yang sudah ada (nama akunmu) |
| **Name** | `carihp` |
| **Database Password** | Buat password kuat, contoh: `CarHP2025!Aman` |
| **Region** | Pilih **Southeast Asia (Singapore)** |

> ⚠️ **PENTING:** Simpan Database Password di Notepad sekarang! Kalau lupa, susah reset.

**3.** Klik **"Create new project"**

**4.** Tunggu **2–3 menit** — ada loading bar, ini normal. Jangan tutup atau refresh halaman.

**5.** Setelah loading selesai, kamu akan melihat dashboard project `carihp` ✅

---

### 2C — Buat Tabel Database (Jalankan SQL)

Ini adalah langkah terpenting di Supabase. Kita akan "memberitahu" database tentang struktur data yang dipakai.

**1.** Di halaman dashboard project, lihat menu di **sisi kiri layar**

**2.** Cari menu bernama **"SQL Editor"**
- Biasanya ikonnya mirip terminal atau database
- Kalau tidak ketemu, coba scroll menu ke bawah

**3.** Klik **"SQL Editor"**

**4.** Klik tombol **"New query"** (atau tombol `+`)

**5.** Sekarang buka file `supabase-schema.sql` yang ada di folder project CariHP yang sudah kamu extract:
- **Windows:** klik kanan file → pilih **"Open with"** → pilih **Notepad**
- **Mac:** klik kanan file → pilih **"Open With"** → pilih **TextEdit**

**6.** Setelah file terbuka di Notepad/TextEdit:
- Tekan **Ctrl+A** (Windows) atau **⌘ Cmd+A** (Mac) → untuk pilih semua teks
- Tekan **Ctrl+C** (Windows) atau **⌘ Cmd+C** (Mac) → untuk copy

**7.** Kembali ke browser (tab Supabase SQL Editor)

**8.** Klik di area kosong putih besar di tengah halaman

**9.** Tekan **Ctrl+V** (Windows) atau **⌘ Cmd+V** (Mac) → untuk paste

**10.** Klik tombol **"Run"** (warna hijau, di pojok kanan bawah)
- Atau tekan **Ctrl+Enter**

**11.** Tunggu beberapa detik...

**12.** Di bagian bawah halaman harus muncul tulisan **"Success. No rows returned"** ✅

> ❌ Kalau muncul teks merah/error: coba refresh halaman Supabase, lalu ulangi dari langkah 3. Kalau masih error, screenshot dan tunjukkan ke saya.

> 🎉 Database selesai! Sudah ada 10 data HP populer yang langsung bisa dipakai.

---

### 2D — Ambil API Keys Supabase

API Keys adalah seperti "kunci" yang menghubungkan website ke database. Kita perlu 3 kunci.

**1.** Di menu kiri Supabase, scroll sampai ke **paling bawah**

**2.** Klik **"Project Settings"** (ikon roda gigi / ⚙️)

**3.** Di menu Settings yang muncul, klik **"API"**

**4.** Kamu akan melihat halaman berisi beberapa key. Catat 3 hal ini di Notepad:

---

**🔑 Kunci #1 — Project URL**

Cari tulisan **"Project URL"**, ada teks seperti ini:
```
https://xyzxyzxyzxyz.supabase.co
```
Klik tombol **"Copy"** di sebelahnya. Paste di Notepad dengan label:
```
SUPABASE URL = (paste di sini)
```

---

**🔑 Kunci #2 — anon / public key**

Scroll sedikit ke bawah, cari bagian **"Project API keys"**

Ada baris bertuliskan **"anon"** atau **"public"** — di sebelahnya ada string panjang dimulai `eyJ...`

Klik tombol **"Copy"** di sebelahnya. Paste di Notepad:
```
SUPABASE ANON KEY = (paste di sini)
```

---

**🔑 Kunci #3 — service_role key**

Di bawah anon key, ada baris bertuliskan **"service_role"**

Klik tombol **"Reveal"** dulu → baru klik **"Copy"**

Paste di Notepad:
```
SUPABASE SERVICE KEY = (paste di sini)
```

> ⚠️ **Jangan pernah share service_role key ke siapapun!** Key ini punya akses penuh ke database kamu.

---

## LANGKAH 3 — Setup RapidAPI

> **Apa itu RapidAPI?**
> RapidAPI digunakan untuk mengambil data spesifikasi dan foto HP secara otomatis dari database GSMArena. Jadi kamu tidak perlu input data HP satu-satu secara manual.

### 3A — Buat Akun RapidAPI

**1.** Buka `https://rapidapi.com`

**2.** Klik **"Sign Up"** di pojok kanan atas

**3.** Pilih cara daftar: bisa pakai **Email**, **Google**, atau **GitHub**

**4.** Ikuti proses pendaftaran. Verifikasi email kalau diminta.

**5.** Setelah masuk ke dashboard RapidAPI ✅

---

### 3B — Subscribe ke GSMArena API

**1.** Setelah login, buka link ini langsung di browser:
```
https://rapidapi.com/controller2042000/api/gsmarenaparser
```

**2.** Kamu akan melihat halaman API GSMArena Parser

**3.** Klik tab **"Pricing"** yang ada di bagian atas halaman

**4.** Cari plan yang **gratis** (biasanya ada tulisan `$0/month` atau `Free`)

**5.** Klik tombol **"Subscribe"** di plan gratis tersebut

**6.** Kalau muncul form konfirmasi, klik **"Subscribe"** lagi atau **"Confirm"**

**7.** Setelah berhasil subscribe, kamu akan kembali ke halaman API ✅

---

### 3C — Ambil API Key RapidAPI

**1.** Pastikan kamu masih di halaman:
```
https://rapidapi.com/controller2042000/api/gsmarenaparser
```

**2.** Klik tab **"Endpoints"** di bagian atas

**3.** Di panel kiri, klik salah satu endpoint yang tersedia (endpoint apapun, pilih yang pertama)

**4.** Di panel **kanan**, kamu akan melihat contoh kode. Cari bagian seperti ini:

```
"X-RapidAPI-Key": "abc123def456ghi789jkl"
```

**5.** Nilai setelah tanda titik dua itulah API key kamu

**6.** Klik tombol **"Copy"** kalau ada, atau blok teks key-nya lalu copy manual

**7.** Paste di Notepad:
```
RAPIDAPI KEY = (paste di sini)
```

> 💡 **Tidak ketemu key-nya?**
> Coba klik avatar/foto profil di pojok kanan atas → cari menu **"Apps"** atau **"Application"** → klik app yang ada → di sana biasanya ada API key.
> Atau cari tombol **"Code Snippets"** di halaman endpoint — key biasanya terlihat di sana.

---

## LANGKAH 4 — Setup Groq (AI)

> **Apa itu Groq?**
> Groq adalah layanan AI yang digunakan untuk fitur rekomendasi HP dan verdict "Worth It Mana?". Sangat cepat dan gratis untuk skala kecil.

**1.** Buka `https://console.groq.com`

**2.** Klik **"Sign Up"**

**3.** Daftar menggunakan **Google** atau **Email** — pilih yang lebih mudah

**4.** Verifikasi email kalau diminta (cek inbox, klik link verifikasi)

**5.** Setelah masuk dashboard Groq, lihat menu di **sisi kiri**

**6.** Klik menu **"API Keys"**

**7.** Klik tombol **"Create API Key"**

**8.** Di kolom **Name**, ketik: `carihp`

**9.** Klik **"Submit"**

**10.** 🚨 **PERHATIAN:** Sebuah key akan muncul sekali ini saja, bentuknya seperti:
```
gsk_aBcDeFgHiJkLmNoPqRsTuV
```

**Segera copy dan paste di Notepad sekarang juga!**
```
GROQ KEY = (paste di sini)
```

Kalau jendela ditutup tanpa copy, key hilang dan harus buat ulang.

---

## LANGKAH 5 — Setup Resend (Email)

> **Apa itu Resend?**
> Resend digunakan untuk mengirim email notifikasi ke user ketika harga HP di watchlist mereka turun. Gratis sampai 3.000 email per bulan.

**1.** Buka `https://resend.com`

**2.** Klik tombol **"Get Started"** atau **"Sign Up"**

**3.** Daftar dengan email

**4.** Cek inbox email kamu → klik link verifikasi yang dikirim Resend

**5.** Setelah masuk dashboard, lihat menu kiri → klik **"API Keys"**

**6.** Klik tombol **"Create API Key"**

**7.** Isi form:
   - **Name:** `carihp`
   - **Permission:** pilih **"Full Access"**
   - **Domain:** biarkan default / "All domains"

**8.** Klik **"Add"**

**9.** Key akan muncul, bentuknya seperti:
```
re_aBcDeFgHiJkLmNoPqRsT
```

**10.** Copy dan paste di Notepad:
```
RESEND KEY = (paste di sini)
```

---

## LANGKAH 6 — Jalankan Website

Sekarang kita gabungkan semua key yang sudah dikumpulkan dan jalankan websitenya!

### 6A — Extract File ZIP

**1.** Cari file **`carihp-v2.zip`** yang sudah kamu download (biasanya di folder Downloads)

**2.** Extract/buka ZIP:
- **Windows:** klik kanan file ZIP → pilih **"Extract All..."** → klik **"Extract"**
- **Mac:** cukup klik dua kali file ZIP → otomatis ter-extract

**3.** Hasilnya adalah folder bernama **`carihp2`**

---

### 6B — Buat File `.env.local`

File ini adalah tempat menyimpan semua key/password agar website bisa terhubung ke semua layanan.

**1.** Buka folder **`carihp2`**

**2.** Cari file bernama **`.env.example`**

> 💡 **File tidak terlihat?** File yang diawali titik (`.`) biasanya tersembunyi.
> - **Windows:** buka File Explorer → klik tab **"View"** di menu atas → centang kotak **"Hidden items"**
> - **Mac:** di jendela Finder, tekan **⌘ Cmd + Shift + .** (titik/period) untuk tampilkan file tersembunyi

**3.** Setelah file `.env.example` terlihat:
- **Klik kanan** file tersebut
- Pilih **"Copy"** (Windows) atau **"Copy"** (Mac)

**4.** Klik di area kosong dalam folder yang sama (jangan klik file apapun)
- **Klik kanan** → pilih **"Paste"**

**5.** Sekarang ada dua file: `.env.example` dan salinannya. Rename salinannya:
- **Windows:** klik kanan file salinan → **"Rename"** → hapus semua nama lama → ketik persis: `.env.local` → Enter → klik **"Yes"** kalau ada popup
- **Mac:** klik file salinan sekali → tekan **Enter** → hapus nama lama → ketik: `.env.local` → Enter

**6.** Buka file `.env.local`:
- **Windows:** klik kanan → **"Open with"** → **"Notepad"**
- **Mac:** klik kanan → **"Open With"** → **"TextEdit"**

**7.** Kamu akan melihat isi file seperti ini:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...
RAPIDAPI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_PASSWORD=passwordrahasiakamu123
CRON_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**8.** Ganti nilai setelah tanda `=` dengan key yang ada di Notepad kamu. Contoh hasil akhir:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
RAPIDAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
GROQ_API_KEY=gsk_a1B2c3D4e5F6g7H8i9J0
RESEND_API_KEY=re_a1B2c3D4e5F6g7H8
ADMIN_PASSWORD=PasswordRahasiaSaya123
CRON_SECRET=kalimatacaksebagaipengaman456
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Aturan penting saat isi file ini:**
> - Tidak boleh ada spasi sebelum dan sesudah tanda `=`
> - Tidak perlu tanda kutip (`"`) di nilai
> - Jangan hapus baris `NEXT_PUBLIC_APP_URL=http://localhost:3000`

**9.** Simpan file: **Ctrl+S** (Windows) atau **⌘ Cmd+S** (Mac)

**10.** Tutup Notepad/TextEdit

---

### 6C — Buka Terminal di Folder Project

Kita perlu membuka Terminal (alat ketik perintah) tepat di dalam folder `carihp2`.

**Windows — Cara Paling Mudah:**
1. Buka folder `carihp2` di File Explorer
2. Klik di **address bar** — kotak panjang di bagian atas yang menampilkan lokasi folder (biasanya tertulis sesuatu seperti `C:\Users\Nama\Downloads\carihp2`)
3. Seleksi semua teks di address bar (otomatis terseksi saat diklik)
4. Ketik: `cmd`
5. Tekan **Enter**
6. Jendela Command Prompt akan terbuka, otomatis sudah di folder yang benar ✅

**Mac — Cara Paling Mudah:**
1. Buka aplikasi **Terminal** (Cmd+Spasi → ketik Terminal)
2. Di Terminal, ketik `cd ` (huruf c, d, spasi — jangan tekan Enter dulu)
3. Buka Finder, navigasi ke folder `carihp2`
4. **Drag** folder `carihp2` ke jendela Terminal
5. Path folder otomatis terisi
6. Tekan **Enter** ✅

---

### 6D — Install Paket yang Dibutuhkan

Di Terminal yang sudah terbuka, ketik perintah berikut lalu tekan **Enter**:

```
npm install
```

Ini akan mendownload semua "bahan" yang dibutuhkan website.

- **Lama:** 2–5 menit tergantung kecepatan internet
- **Normal:** banyak teks bermunculan, ini tidak apa-apa
- **Selesai:** kalau sudah kembali ke prompt (`>` di Windows, `$` di Mac)

> ❌ Kalau muncul error **"EACCES"** (biasanya di Mac):
> Ketik: `sudo npm install` → masukkan password laptop kamu → Enter

---

### 6E — Jalankan Website!

Setelah `npm install` selesai, ketik perintah ini lalu tekan **Enter**:

```
npm run dev
```

Tunggu beberapa detik sampai muncul tulisan seperti ini di Terminal:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

---

### 6F — Buka Website di Browser

**1.** Buka browser (Chrome, Firefox, Edge, Safari — apapun)

**2.** Klik di address bar browser (bukan address bar file explorer)

**3.** Ketik: `http://localhost:3000`

**4.** Tekan **Enter**

## 🎉 Website CariHP.id sekarang berjalan di laptopmu!

Kamu akan melihat halaman utama dengan 10 HP populer yang sudah tersedia.

---

## Cara Pakai Website

### 🔍 Cari HP
- Ketik nama HP di search bar di halaman utama
- Gunakan tombol **"Filter"** untuk filter berdasarkan brand, harga, RAM
- Klik tombol kategori (Gaming, Kamera, dll) untuk lihat HP per kategori

### 🤖 Rekomendasi AI
1. Klik tombol **"Mulai Rekomendasi AI"** di bagian atas halaman
2. Jawab 4 pertanyaan yang muncul satu per satu (tipe pakai, budget, prioritas, brand)
3. Klik **"Lihat Rekomendasi AI"**
4. Kembali ke halaman utama — AI akan menyoroti HP yang paling cocok untukmu

### ⚖️ Bandingkan HP (Maks 4 HP)
1. Di halaman utama, klik tombol **`+`** di pojok kanan bawah kartu HP
2. Ulangi untuk HP lain yang mau dibandingkan (maks 4)
3. Muncul bar di bagian bawah layar → klik **"Bandingkan"**
4. Di halaman perbandingan, klik tombol **"Tanya AI"** untuk dapat analisis jujur

### 🔔 Watchlist (Pantau Harga)
1. Klik nama HP manapun untuk masuk ke halaman detail
2. Klik tombol **"Tambah ke Watchlist"**
3. Isi email kamu dan target harga (harga yang kamu mau)
4. Kamu akan dapat email otomatis kalau harga HP tersebut turun

### 📦 Cari HP Bekas
- Di halaman detail HP, ada bagian **"Cari Unit Bekas"**
- Klik platform yang kamu mau (Tokopedia, Shopee, OLX, Facebook)
- Langsung masuk ke halaman pencarian HP tersebut

---

## Cara Pakai Admin Panel

Admin panel adalah tempat kamu mengelola data HP dan mengisi link affiliate.

### Cara Masuk ke Admin Panel
1. Di browser, ketik: `http://localhost:3000/admin`
2. Masukkan password yang kamu tulis di `ADMIN_PASSWORD` di file `.env.local`
3. Klik **"Masuk"**

---

### Tambah HP Baru Secara Otomatis

Kamu tidak perlu input data HP secara manual — cukup ketik nama dan sistem fetch otomatis.

**1.** Di bagian atas admin panel, ada kotak dengan judul **"Tambah HP Baru via RapidAPI"**

**2.** Ketik nama HP yang mau ditambahkan. Contoh:
```
Samsung Galaxy S25 Ultra
```

**3.** Klik tombol **"Fetch HP"**

**4.** Tunggu sekitar **5–15 detik**

**5.** Kalau berhasil, muncul notifikasi hijau dan HP langsung masuk ke tabel bawah ✅

**6.** Kalau gagal, coba nama yang lebih umum/berbeda:
```
Samsung S25 Ultra
```

> 💡 Tips nama HP yang baik: gunakan nama brand + seri + varian. Contoh: `iPhone 15 Pro Max`, `Xiaomi 14 Ultra`, `OPPO Reno 12 Pro`

---

### Input Link Affiliate (Untuk Monetisasi)

Setiap HP yang diklik user bisa diarahkan ke link Shopee/TikTok affiliate milikmu.

**1.** Di tabel HP, cari nama HP yang mau diisi link affiliate-nya
- Gunakan kotak search di atas tabel
- Ketik nama HP → hasil langsung terfilter

**2.** Klik tombol **"Edit"** di sebelah kanan baris HP tersebut

**3.** Kolom yang bisa diisi:
- **Override Harga IDR** → isi dengan harga resmi Indonesia kalau tahu (opsional)
- **Link Shopee** → paste link affiliate Shopee kamu
- **Link TikTok** → paste link affiliate TikTok Shop kamu

**4.** Klik **"Simpan"**

**5.** ✅ Link langsung muncul di halaman detail HP tersebut sebagai tombol "Beli di Shopee" / "Beli di TikTok Shop"

---

### Cara Dapat Link Affiliate Shopee

**1.** Daftar sebagai affiliate Shopee di: `https://affiliate.shopee.co.id`
- Klik **"Bergabung Sekarang"**
- Isi form pendaftaran
- Tunggu persetujuan (biasanya 1–3 hari kerja)

**2.** Setelah disetujui dan login:
- Cari produk HP yang mau kamu promosikan
- Klik produknya → klik tombol **"Dapatkan Link"** atau **"Buat Link Affiliate"**
- Copy link yang muncul

**3.** Paste link tersebut ke admin panel CariHP

---

### Cara Dapat Link Affiliate TikTok Shop

**1.** Daftar di: `https://affiliate.tiktok.com`
- Klik **"Sign Up as Creator Affiliate"**
- Isi form dan ikuti prosesnya

**2.** Setelah diterima:
- Masuk ke dashboard → cari produk HP
- Klik produk → copy link affiliate

**3.** Paste ke admin panel CariHP

---

## Matikan & Nyalakan Website

**Untuk mematikan website:**
1. Klik di jendela Terminal/Command Prompt yang sedang jalan
2. Tekan **Ctrl+C**
3. Website berhenti

**Untuk menjalankan lagi lain waktu:**
1. Buka Terminal/Command Prompt di folder `carihp2` (cara sama seperti Langkah 6C)
2. Ketik: `npm run dev`
3. Buka browser → `http://localhost:3000`

---

## Upload ke Internet (Opsional)

Supaya website bisa diakses dari HP atau oleh orang lain, perlu di-upload ke server. Kita pakai Vercel — gratis.

### Step 1 — Upload Kode ke GitHub

**1.** Pastikan kamu punya akun GitHub (daftar di `https://github.com`)

**2.** Login ke GitHub

**3.** Klik tombol **`+`** di pojok kanan atas → pilih **"New repository"**

**4.** Isi:
- **Repository name:** `carihp`
- Pilih **"Private"** (agar kode tidak bisa dilihat orang lain)
- Jangan centang apapun yang lain

**5.** Klik **"Create repository"**

**6.** Di halaman yang muncul, copy semua perintah yang ada di bagian **"…or push an existing repository from the command line"**

**7.** Buka Terminal di folder `carihp2`

**8.** Paste dan jalankan perintah-perintah tersebut satu per satu. Contohnya seperti ini:
```
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAMEMU/carihp.git
git push -u origin main
```
> Ganti `USERNAMEMU` dengan username GitHub kamu yang sebenarnya

**9.** Masukkan username dan password GitHub kalau diminta

**10.** ✅ Kode sudah terupload ke GitHub

---

### Step 2 — Deploy ke Vercel

**1.** Buka `https://vercel.com`

**2.** Klik **"Sign Up"** → login dengan GitHub

**3.** Di dashboard Vercel, klik **"New Project"** atau **"Add New..."**

**4.** Kamu akan lihat daftar repository GitHub kamu → klik **"Import"** di sebelah `carihp`

**5.** Di halaman berikutnya, **sebelum klik Deploy**, tambahkan semua environment variables:
- Scroll ke bawah, cari bagian **"Environment Variables"**
- Untuk setiap baris di file `.env.local` kamu, klik **"Add"** dan isi:
  - **Name:** nama variabel (contoh: `NEXT_PUBLIC_SUPABASE_URL`)
  - **Value:** nilainya (contoh: `https://xxx.supabase.co`)
- Ulangi untuk semua variabel
- Untuk `NEXT_PUBLIC_APP_URL`: isi dulu dengan `https://carihp.vercel.app`

**6.** Klik **"Deploy"**

**7.** Tunggu **3–5 menit** sampai proses selesai

**8.** ✅ Website online! Kamu dapat URL seperti: `https://carihp-abc123.vercel.app`

**9.** Update URL yang sebenarnya:
- Di dashboard Vercel → klik project `carihp`
- Klik tab **"Settings"** → klik **"Environment Variables"**
- Cari `NEXT_PUBLIC_APP_URL` → klik edit
- Ganti nilainya dengan URL Vercel yang baru saja kamu dapat
- Klik **"Save"** → Vercel otomatis update website (tunggu 1–2 menit)

---

## Kalau Ada Error

Berikut error yang paling sering terjadi dan cara mengatasinya:

---

**❌ `'node' is not recognized as an internal or external command`**

Artinya: Node.js belum terinstall atau belum dikenali sistem.

Solusi:
1. Pastikan sudah install Node.js dari `https://nodejs.org`
2. Restart laptop
3. Coba lagi

---

**❌ Website terbuka tapi layar putih atau muncul banyak error merah di Terminal**

Artinya: Ada yang salah di file `.env.local`

Solusi:
1. Cek apakah file `.env.local` sudah ada di folder `carihp2`
2. Buka file → pastikan semua nilai sudah diisi, tidak ada yang masih `xxxxx`
3. Pastikan tidak ada spasi di sekitar tanda `=`
4. Simpan file → stop website (Ctrl+C) → jalankan lagi (`npm run dev`)

---

**❌ "Fetch HP" di admin gagal / tidak merespon**

Artinya: Ada masalah dengan RapidAPI

Solusi:
1. Pastikan `RAPIDAPI_KEY` di `.env.local` sudah benar
2. Pastikan sudah subscribe ke GSMArena API di RapidAPI
3. Coba nama HP yang berbeda (lebih umum)

---

**❌ Fitur AI tidak merespon atau error**

Artinya: Ada masalah dengan Groq

Solusi:
1. Pastikan `GROQ_API_KEY` sudah benar dan dimulai dengan `gsk_`
2. Buka `https://console.groq.com` → cek apakah key masih aktif

---

**❌ `Module not found` atau `Cannot find module`**

Artinya: Paket belum terinstall

Solusi:
1. Stop website dulu (Ctrl+C)
2. Ketik: `npm install`
3. Tunggu selesai
4. Jalankan lagi: `npm run dev`

---

**❌ Email watchlist tidak terkirim**

Ini **normal** saat website jalan di laptop (localhost). Email hanya terkirim otomatis setelah website di-deploy ke Vercel.

---

**❌ Foto HP tidak muncul (gambar kosong/broken)**

Ini kadang terjadi untuk HP yang baru di-fetch. Solusi:
1. Refresh halaman beberapa kali
2. Kalau tetap tidak muncul, masuk ke Supabase → Table Editor → `smartphones` → cari HP tersebut → edit kolom `image_url` secara manual

---

Selamat! Kalau semua langkah berhasil, **CariHP.id** sudah siap digunakan. 🚀
