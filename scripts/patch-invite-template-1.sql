-- Patch all invite defaults to template #1 (Undangan Resmi / formal-kristen).
-- Also mirrors the same copy onto singkat-sopan so production still picks it up
-- while the live bundle remaps formal-kristen → singkat-sopan (pre-deploy hotfix).

begin;

update site_content
set content = jsonb_set(
  jsonb_set(
    coalesce(content, '{}'::jsonb),
    '{invite,defaultTemplateId}',
    to_jsonb('formal-kristen'::text),
    true
  ),
  '{invite,whatsappTemplates}',
  (
    select coalesce(
      jsonb_agg(tmpl order by ordinality),
      '[]'::jsonb
    )
    from (
      select
        case
          when t.tmpl->>'id' = 'formal-kristen'
            or coalesce(t.tmpl->>'message', '') like 'Kepada Yth.%'
            or coalesce(t.tmpl->>'message', '') like 'Shalom,%'
            or coalesce(t.tmpl->>'message', '') like '%mengucap syukur kepada Tuhan Yesus Kristus%'
          then jsonb_build_object(
            'id', 'formal-kristen',
            'name', '1. Undangan Resmi',
            'message', $tpl$Kepada Yth.
Bapak/Ibu/Saudara/i
*{nama}*

Dengan senang hati kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan merayakan:

Pesta Pernikahan {pasangan}

Informasi lengkap dapat dilihat melalui undangan digital berikut:

{link}

Dengan penuh kasih, kami menantikan kehadiran Bapak/Ibu/Saudara/i.

Salam hormat,
{pasangan}.$tpl$
          )
          when t.tmpl->>'id' = 'singkat-sopan'
          then jsonb_build_object(
            'id', 'singkat-sopan',
            'name', '1. Undangan Resmi',
            'message', $tpl$Kepada Yth.
Bapak/Ibu/Saudara/i
*{nama}*

Dengan senang hati kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan merayakan:

Pesta Pernikahan {pasangan}

Informasi lengkap dapat dilihat melalui undangan digital berikut:

{link}

Dengan penuh kasih, kami menantikan kehadiran Bapak/Ibu/Saudara/i.

Salam hormat,
{pasangan}.$tpl$
          )
          else t.tmpl
        end as tmpl,
        t.ordinality
      from jsonb_array_elements(
        coalesce(content #> '{invite,whatsappTemplates}', '[]'::jsonb)
      ) with ordinality as t(tmpl, ordinality)
    ) patched
  ),
  true
)
where id = 'main';

-- If templates array is empty/missing, seed the canonical set with #1 as default.
update site_content
set content = jsonb_set(
  jsonb_set(
    coalesce(content, '{}'::jsonb),
    '{invite,defaultTemplateId}',
    to_jsonb('formal-kristen'::text),
    true
  ),
  '{invite,whatsappTemplates}',
  $templates$[
    {
      "id": "formal-kristen",
      "name": "1. Undangan Resmi",
      "message": "Kepada Yth.\nBapak/Ibu/Saudara/i\n*{nama}*\n\nDengan senang hati kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan merayakan:\n\nPesta Pernikahan {pasangan}\n\nInformasi lengkap dapat dilihat melalui undangan digital berikut:\n\n{link}\n\nDengan penuh kasih, kami menantikan kehadiran Bapak/Ibu/Saudara/i.\n\nSalam hormat,\n{pasangan}."
    },
    {
      "id": "formal-nasional",
      "name": "2. Formal Sopan",
      "message": "{salam} {nama},\n\nDengan memohon berkat Tuhan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\n💍 {pasangan}\n📅 {tanggal}\n📍 {lokasi}\n\nMerupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir dan mendoakan kami.\n\nSilakan buka undangan melalui link berikut:\n{link}\n\nAtas perhatian dan doanya, kami ucapkan terima kasih.\nTuhan memberkati."
    },
    {
      "id": "singkat-sopan",
      "name": "1. Undangan Resmi",
      "message": "Kepada Yth.\nBapak/Ibu/Saudara/i\n*{nama}*\n\nDengan senang hati kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan merayakan:\n\nPesta Pernikahan {pasangan}\n\nInformasi lengkap dapat dilihat melalui undangan digital berikut:\n\n{link}\n\nDengan penuh kasih, kami menantikan kehadiran Bapak/Ibu/Saudara/i.\n\nSalam hormat,\n{pasangan}."
    }
  ]$templates$::jsonb,
  true
)
where id = 'main'
  and jsonb_array_length(coalesce(content #> '{invite,whatsappTemplates}', '[]'::jsonb)) = 0;

commit;

select
  content #>> '{invite,defaultTemplateId}' as default_template,
  (
    select jsonb_agg(jsonb_build_object('id', t->>'id', 'name', t->>'name'))
    from jsonb_array_elements(content #> '{invite,whatsappTemplates}') t
  ) as templates,
  (
    select left(t->>'message', 40)
    from jsonb_array_elements(content #> '{invite,whatsappTemplates}') t
    where t->>'id' = 'formal-kristen'
    limit 1
  ) as formal_preview
from site_content
where id = 'main';
