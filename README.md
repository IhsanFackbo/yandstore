# TokoKu — Yandx Store (Vercel) — Keranjang & Pembelian WhatsApp

Versi Next.js yang siap di-deploy ke Vercel dengan validasi Cloudflare
Turnstile melalui server-side API route. Alur pembelian diperjelas:
**+ Keranjang** untuk disimpan dan **Beli Sekarang** untuk WhatsApp langsung.

## Deploy ke Vercel

1. Ekstrak ZIP lalu unggah folder ini ke GitHub.
2. Di Vercel pilih **Add New → Project**, lalu impor repository tersebut.
3. Tambahkan Environment Variables berikut untuk Production, Preview, dan
   Development:

   ```env
   TURNSTILE_SITE_KEY=site_key_Cloudflare_Anda
   TURNSTILE_SECRET_KEY=secret_key_Cloudflare_Anda
   NEXT_PUBLIC_ORDER_WHATSAPP_NUMBER=6285124081626
   ```

4. Pastikan `NEXT_PUBLIC_ORDER_WHATSAPP_NUMBER` diisi dengan nomor admin yang benar.
   Nomor default `6285124081626` diambil dari tautan checkout pada proyek asal;
   nomor berbeda yang tadinya tertera di footer kini diseragamkan.
5. Klik **Deploy**.

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

Untuk menguji pembuatan tautan WhatsApp dan penyimpanan keranjang, jalankan
`npm test` (Node.js 22).

Buka `http://localhost:3000`.

## Cara kerja pemesanan

- **+ Keranjang:** menyimpan pilihan untuk nanti, tidak membuka WhatsApp. Data
  (ID produk dan jumlah) disimpan di `localStorage` browser yang sama sehingga
  tetap ada sesudah refresh atau tab ditutup, kecuali pembeli menghapus data
  browser/menjalankan mode privat. Nama dan harga dimuat ulang dari katalog.
- **Beli Sekarang:** langsung membuka WhatsApp admin di tab baru berisi **satu
  produk** yang diklik, 1 item, harga, subtotal, dan total; tidak menambah isi
  keranjang dan tidak memerlukan Cloudflare Turnstile.
- **Keranjang → Pesan Semua via WhatsApp:** ubah jumlah atau hapus produk, lalu
  selesaikan Cloudflare Turnstile. Setelah lolos verifikasi, tab saat ini
  dialihkan ke WhatsApp dengan **seluruh isi keranjang** dan totalnya. Cara ini
  menghindari pemblokiran tab baru setelah permintaan verifikasi asinkron.
- Membuka WhatsApp **bukan** transaksi atau pengiriman pesan otomatis. Pembeli
  harus menekan **Kirim** di WhatsApp. Oleh sebab itu keranjang **tidak
  otomatis dikosongkan** ketika tombol pemesanan diklik.

## Pengaturan nomor admin

Atur `NEXT_PUBLIC_ORDER_WHATSAPP_NUMBER` di `.env.local` (lokal) atau
Environment Variables Vercel (produksi). Gunakan format internasional,
misalnya `6281234567890`. Setelah mengubah variabel ini di Vercel, lakukan
**Redeploy** agar link WhatsApp pada halaman diperbarui. Nomor yang tampil di
footer akan mengikuti nomor konfigurasi yang sama.

Catatan: website ini meneruskan *draft* pesanan ke WhatsApp, **tidak**
menyimpan order di server, menerima pembayaran, atau mengirim chat otomatis.
Gunakan kunci Turnstile produksi sebelum memakai checkout keranjang di toko
publik.
