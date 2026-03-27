-- Script ini akan mengosongkan image_url untuk semua HP yang masih
-- pakai URL GSMArena (yang diblokir), supaya website tampilkan placeholder
-- daripada gambar broken.
--
-- Jalankan di: Supabase Dashboard → SQL Editor → paste → Run

UPDATE smartphones
SET image_url = ''
WHERE image_url LIKE '%gsmarena.com%'
   OR image_url LIKE '%fdn2.%'
   OR image_url LIKE '%fdn.%';

-- Cek hasilnya
SELECT id, name, image_url
FROM smartphones
ORDER BY created_at DESC;
