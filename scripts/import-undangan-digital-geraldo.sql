-- Import Undangan Digital Geraldo.xlsx (21 tamu)
-- Includes Excel Keterangan → guests.notes
-- Template bawaan daftar tamu: 3. Singkat & Sopan (singkat-sopan)

begin;

alter table guests add column if not exists notes text;

insert into guests (slug, display_name, phone, notes)
values
  ('ratieh', 'Ratieh', '082111990030', 'Tim Proyek HBR 2'),
  ('salim', 'Salim', '083872060800', 'Tim Proyek HBR 2'),
  ('noviyanti', 'Noviyanti', '081285892999', 'Tim Proyek HBR 2'),
  ('zahra-alya-darojati', 'Zahra Alya Darojati', '081286917836', 'Tim Proyek HBR 2'),
  ('venissa', 'Venissa', '082110469150', 'Tim Proyek HBR 2'),
  ('karim', 'Karim', '085785626789', 'Tim Proyek HBR 2'),
  ('puti-dian-syafitri', 'Puti Dian Syafitri', '089650582775', 'Tim Proyek HBR 2'),
  ('danang-yanuarianto', 'Danang Yanuarianto', '087729958817', 'Tim Proyek HBR 2'),
  ('chikita-venesa', 'Chikita Venesa', '081316882233', 'Tim Proyek HBR 2'),
  ('dzaky-rizaldi', 'Dzaky Rizaldi', '087777100080', 'Tim Proyek HBR 2'),
  ('alfian-nugroho', 'Alfian Nugroho', '082142803753', 'Tim Proyek HBR 2'),
  ('gunawan', 'Gunawan', '085280425244', 'Tim Proyek HBR 2'),
  ('doni', 'Doni', '087770611975', 'Tim Proyek HBR 2'),
  ('ade', 'Ade', '0895391606832', 'Tim Proyek HBR 2'),
  ('hardy', 'Hardy', '082316278500', 'Tim Proyek HBR 2'),
  ('ardiyan', 'Ardiyan', '081389959501', 'Tim Proyek HBR 2'),
  ('diaz', 'Diaz', '082128751694', 'PT. CMNP'),
  ('denny', 'Denny', '081911822688', 'PT. CMNP'),
  ('dwinny', 'Dwinny', '085777465129', 'PT. CMNP'),
  ('yusdi', 'Yusdi', '085694043123', 'PT. CMNP'),
  ('anang-keisha', 'Anang Keisha', '081282062288', 'PT. CMNP')
on conflict (slug) do update
set
  display_name = excluded.display_name,
  phone = coalesce(excluded.phone, guests.phone),
  notes = excluded.notes;

update site_content
set content = jsonb_set(
  coalesce(content, '{}'::jsonb),
  '{invite,defaultTemplateId}',
  to_jsonb('singkat-sopan'::text),
  true
)
where id = 'main';

commit;

select count(*) as guest_count from guests;
select count(*) filter (where notes is not null and notes <> '') as with_notes from guests;
select content #>> '{invite,defaultTemplateId}' as default_template
from site_content
where id = 'main';
