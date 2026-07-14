-- Seed dummy guests with WhatsApp numbers (safe to re-run)
insert into guests (slug, display_name, phone) values
  ('jeffry-istri', 'Jeffry & Istri', '081234567801'),
  ('budi-santoso', 'Budi Santoso', '081234567802'),
  ('siti-rahayu', 'Siti Rahayu', '081234567803'),
  ('andi-wijaya', 'Andi Wijaya', '081234567804'),
  ('putri-lestari', 'Putri Lestari', '081234567805'),
  ('keluarga-santoso', 'Keluarga Santoso', '081234567806'),
  ('rina-dewi', 'Rina Dewi', '081234567807'),
  ('toni-hartono', 'Toni Hartono', '081234567808'),
  ('maya-kartika', 'Maya Kartika', '081234567809'),
  ('hendra-gunawan', 'Bpk. Hendra Gunawan', '081234567810')
on conflict (slug) do update set
  display_name = excluded.display_name,
  phone = excluded.phone;
