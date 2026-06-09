# Kingdoms of Ruin 🏰⚔️

**Kingdoms of Ruin** adalah prototipe game RPG 2D top-down berbasis web yang memadukan petualangan retro dengan sistem backend real-time. Pemain dapat menjelajahi dunia fantasi, berinteraksi dengan landmark (seperti api unggun dan peti harta karun), mengumpulkan sumber daya, serta melengkapi perlengkapan pahlawan secara instan melalui sistem inventaris terintegrasi.

---

> [!IMPORTANT]
> **Status Proyek: Masih Dalam Pengerjaan (Work In Progress - WIP)**
> Proyek ini sedang aktif dikembangkan. Beberapa fitur mungkin masih berupa prototipe dan terus mengalami pembaruan berkala pada antarmuka (UI), penyeimbangan stats, maupun integrasi database.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Proyek ini dibangun menggunakan arsitektur modern multi-module yang memisahkan sisi klien (frontend) dan server (backend):

### 1. Klien & Antarmuka (Frontend)
* **Game Engine**: [Phaser 3](https://phaser.io/) (Framework HTML5 game engine yang tangguh untuk rendering 2D).
* **Build Tool & Bundler**: [Vite](https://vitejs.dev/) (Menjamin reload modul yang instan saat proses development).
* **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/) (Menyediakan static typing untuk keandalan kode).
* **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Manajemen state pahlawan, posisi pemain, dan inventaris secara ringkas).
* **Desain UI**: Custom graphics rendering menggunakan Phaser primitif untuk antarmuka pahlawan bergaya klasik.

### 2. Server & Database (Backend)
* **Bahasa Pemrograman**: [Go (Golang) 1.21](https://go.dev/) (Memberikan performa tinggi dan konkurensi yang efisien).
* **Web Framework**: [Fiber v2](https://gofiber.io/) (Framework web berbasis fasthttp yang sangat cepat dan ringan).
* **Database Driver**: [pgx/v5](https://github.com/jackc/pgx) (Driver PostgreSQL berkinerja tinggi dengan sistem *connection pooling*).
* **Database Migration**: [Golang-Migrate](https://github.com/golang-migrate/migrate) (Untuk pelacakan dan penerapan migrasi skema database secara terstruktur).
* **Database Utama**: [PostgreSQL](https://www.postgresql.org/) (Penyimpanan persisten untuk data inventaris pemain, stats, dan equipment).

---

## 📁 Struktur Folder Proyek

* `backend/` : Berisi kode server Go, API route, migrasi database, dan logika database.
* `frontend/` : Berisi source code Phaser 3, stores (Zustand), aset, scene utama, dan file antarmuka (UI).
* `docs/` : Berisi dokumentasi dan panduan perencanaan proyek.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Untuk menjalankan game ini secara lokal, pastikan Anda telah menginstal **Go**, **Node.js/npm**, dan memiliki database **PostgreSQL** yang berjalan.

### 1. Menjalankan Backend (Server API)
Masuk ke direktori backend, buat database PostgreSQL yang sesuai, atur konfigurasi koneksi, lalu jalankan:
```bash
cd backend
go run cmd/server/main.go
```
*Server API akan berjalan pada port `8080`.*

### 2. Menjalankan Frontend (Vite Dev Server)
Masuk ke direktori frontend, instal dependensi, lalu jalankan server pengembangan:
```bash
cd frontend
npm install
npm run dev
```
*Vite akan membuka server lokal (biasanya pada `http://localhost:5173/`). Seluruh permintaan API dari frontend secara otomatis di-proxy ke server backend di port `8080`.*
