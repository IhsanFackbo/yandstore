# TokoKu — Yandx Store (Vercel)

Versi Next.js yang siap di-deploy ke Vercel dengan validasi Cloudflare
Turnstile melalui server-side API route.

## Deploy ke Vercel

1. Ekstrak ZIP lalu unggah folder ini ke GitHub.
2. Di Vercel pilih **Add New → Project**, lalu impor repository tersebut.
3. Tambahkan Environment Variables berikut untuk Production, Preview, dan
   Development:

   ```env
   TURNSTILE_SITE_KEY=site_key_Cloudflare_Anda
   TURNSTILE_SECRET_KEY=secret_key_Cloudflare_Anda
   ```

4. Klik **Deploy**.

Framework preset akan terdeteksi sebagai **Next.js**. Build command dan output
directory tidak perlu diubah.

## Pengaturan Cloudflare Turnstile

Masukkan domain produksi Vercel, misalnya `nama-proyek.vercel.app`, ke daftar
hostname widget Turnstile di dashboard Cloudflare. Tambahkan juga custom domain
jika digunakan.

`TURNSTILE_SITE_KEY` boleh dibaca saat server merender halaman. Sebaliknya,
`TURNSTILE_SECRET_KEY` hanya dibaca oleh API route
`app/api/turnstile/route.ts` dan tidak pernah dikirim ke browser.

Tanpa environment variables, proyek memakai test key resmi Cloudflare agar
alur dapat diuji. Ganti dengan kunci produksi sebelum toko digunakan.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.
