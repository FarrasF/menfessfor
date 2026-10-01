# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Upload Gambar Menfess

<<<<<<< Updated upstream
Jalankan SQL pada `supabase/migrations/20261001000000_add_menfess_images.sql` melalui Supabase SQL Editor sebelum menggunakan fitur gambar. File ini menambahkan kolom gambar dan token upload pada `menfess`, tabel privat untuk tautan penghapusan ImgBB, serta fungsi rate limit.

Atur `IMGBB_UPLOAD_URL`, `IMGBB_API_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` sebagai environment variable server di Vercel. Untuk lokal, isi variabel tersebut di `.env.local`; gunakan `.env.example` sebagai daftar nama variabel. Jangan beri prefix `VITE_` pada kredensial server. Jangan menaruh key di `.env` yang sudah dilacak Git.

File sumber boleh sampai 30 MB dan harus JPG, PNG, atau WebP. Sebelum dikirim, gambar dipotong menjadi persegi dan dikompres sebagai JPEG maksimal 3,5 MB agar muat batas request function Vercel. Upload dibatasi lima kali per IP per menit. ImgBB tidak diberi parameter expiration, jadi gambar tetap tersimpan sampai moderator menghapusnya.
=======
Salin `.env.example` ke `.env`, lalu isi kredensial Supabase termasuk `SUPABASE_SERVICE_ROLE_KEY` dari Supabase Dashboard. `IMGBB_API_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan oleh endpoint server dan tidak boleh diberi awalan `VITE_`. Tambahkan variabel yang sama pada pengaturan Environment Variables proyek Vercel.

Sebelum mengaktifkan upload, jalankan isi `supabase-image-upload.sql` melalui SQL Editor Supabase. Skrip menambahkan kolom `menfess.url_gambar`, tabel privat untuk URL penghapusan ImgBB, dan pembatas unggah satu gambar per alamat IP setiap menit.

Pengguna dapat memilih gambar JPG, PNG, WebP, GIF, atau AVIF hingga 30 MB. Crop wajib menghasilkan gambar persegi JPEG; file sumber tidak dikirim ke ImgBB. Upload tidak mengirim parameter kedaluwarsa ke ImgBB, sehingga gambar tidak diatur untuk terhapus otomatis.
>>>>>>> Stashed changes
