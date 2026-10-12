-- Seed 50 visible wishes for UI testing (hidden = false).
-- Run in Supabase SQL Editor, then delete when done:
--   delete from wishes where name like 'UI Test %';

insert into wishes (name, message, hidden, created_at)
select
  'UI Test ' || g.n,
  (array[
    'Selamat menempuh hidup baru! Semoga bahagia selalu.',
    'Congrats Geraldo & Christin! God bless your marriage.',
    'Doa terbaik untuk kalian berdua. Happy wedding!',
    'Semoga langgeng sampai kakek nenek ya!',
    'Turut berbahagia. Sampai jumpa di hari H!',
    'Love you both! Semoga rumah tangganya penuh berkat.',
    'Barakallah! Semoga menjadi keluarga yang sakinah.',
    'Happy forever, G & C! Kami doakan yang terbaik.',
    'Akhirnya! Selamat ya, tunggu undangan fisiknya hehe.',
    'Semoga pernikahan kalian penuh sukacita dan kasih.'
  ])[1 + ((g.n - 1) % 10)],
  false,
  now() - (g.n || ' minutes')::interval
from generate_series(1, 50) as g(n);
