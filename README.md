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

Jalankan SQL pada `supabase/migrations/20261001000000_add_menfess_images.sql` melalui Supabase SQL Editor sebelum menggunakan fitur gambar. File ini menambahkan kolom gambar dan token upload pada `menfess`, tabel privat untuk tautan penghapusan ImgBB, serta fungsi rate limit.

Atur `IMGBB_UPLOAD_URL`, `IMGBB_API_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` sebagai environment variable server di Vercel. Untuk lokal, isi variabel tersebut di `.env.local`; gunakan `.env.example` sebagai daftar nama variabel. Jangan beri prefix `VITE_` pada kredensial server. Jangan menaruh key di `.env` yang sudah dilacak Git.

File sumber boleh sampai 30 MB dan harus JPG, PNG, atau WebP. Sebelum dikirim, gambar dipotong menjadi persegi dan dikompres sebagai JPEG maksimal 3,5 MB agar muat batas request function Vercel. Upload dibatasi lima kali per IP per menit. ImgBB tidak diberi parameter expiration, jadi gambar tetap tersimpan sampai moderator menghapusnya.
