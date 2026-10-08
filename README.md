# Akaishi Kuroe Temp Mail

Static HTML project untuk Vercel.

## Deploy
1. Buat repository GitHub baru.
2. Upload `index.html`, `style.css`, `script.js`.
3. Di Vercel pilih Add New Project → import repository.
4. Framework preset: Other.
5. Build Command kosong, Output Directory kosong.
6. Deploy.

API yang dipakai:
- `/tools/tempmail`
- `/tools/cekmail?token=...`

Catatan: format respons API tidak dapat diverifikasi dari lingkungan ini, jadi parser dibuat fleksibel. Jika nama field API berbeda, kirim hasil JSON-nya dan saya sesuaikan.
