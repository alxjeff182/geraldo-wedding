-- Guest list notes (Excel "Keterangan": Tim Proyek, perusahaan, dll.)
alter table guests
  add column if not exists notes text;

comment on column guests.notes is 'Catatan / keterangan undangan (grup, perusahaan, dll.)';
