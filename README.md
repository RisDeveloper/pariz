# Portofolio — M. Teuku Farish

Website portofolio 4 halaman dengan tema **liquid glass ala iOS 26**, background putih/pearl,
dan elemen kaca mengambang. Frontend statis (HTML/CSS/JS), backend Python (Flask) + MySQL
untuk menyimpan pesan dari form kontak.

## Struktur folder

```
portfolio-farish/
├── frontend/
│   ├── index.html        -> Beranda (hero, umur otomatis, tentang saya)
│   ├── pendidikan.html   -> Riwayat pendidikan (timeline)
│   ├── keahlian.html     -> Keahlian & hobi
│   ├── kontak.html       -> Form kontak
│   ├── css/style.css
│   └── js/main.js
└── backend/
    ├── app.py            -> Flask API
    ├── schema.sql         -> Struktur tabel MySQL
    ├── requirements.txt
    └── .env.example
```

## 1. Jalankan frontend

Frontend murni statis, tidak butuh server khusus. Cara paling gampang:

- Buka langsung `frontend/index.html` di browser, **atau**
- Jalankan local server supaya fetch ke backend lebih stabil:
  ```bash
  cd frontend
  python -m http.server 5500
  ```
  lalu buka `http://localhost:5500`

## 2. Siapkan database MySQL

Pastikan MySQL server sudah jalan, lalu:

```bash
cd backend
mysql -u root -p < schema.sql
```

Ini akan membuat database `farish_portfolio` dan tabel `contact_messages`.

## 3. Setup & jalankan backend

```bash
cd backend
cp .env.example .env
# edit .env, isi DB_PASSWORD sesuai MySQL kamu

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
python app.py
```

Backend akan jalan di `http://localhost:5000`.

- `GET  /api/health`  -> cek koneksi database
- `POST /api/contact` -> simpan pesan baru (dipanggil otomatis oleh form di kontak.html)
- `GET  /api/contact` -> lihat semua pesan masuk (opsional, buat cek manual)

## 4. Hubungkan frontend ke backend

Kalau frontend & backend jalan di domain/port yang beda, buka `frontend/js/main.js`
dan isi baris ini dengan alamat backend kamu:

```js
const API_BASE = "http://localhost:5000";
```

Kalau dibiarkan kosong (`""`), form akan memanggil `/api/contact` relatif ke domain
tempat frontend dibuka — cocok kalau nanti frontend & backend disatukan di server yang sama.

## Fitur umur otomatis

Umur di halaman Beranda dihitung otomatis dari tanggal lahir (`11 Oktober 2009`) yang
disetel di `frontend/js/main.js` (variabel `BIRTH_DATE`). Setiap kali halaman dibuka,
umur akan otomatis menyesuaikan — tidak perlu diedit manual setiap tahun.

## Kustomisasi cepat

- Ganti warna aksen: edit variabel `--accent`, `--accent-aqua`, `--accent-amber` di
  `frontend/css/style.css` (bagian `:root`).
- Tambah/ubah skill: edit kartu di `frontend/keahlian.html`, sesuaikan `width` pada
  `.bar-fill` untuk mengubah persentase level.
- Tambah data pendidikan lain: duplikasi blok `.tl-item` di `frontend/pendidikan.html`.
