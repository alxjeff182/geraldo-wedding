-- Refresh default WhatsApp invite template (formal-kristen) to the new formal copy.
update site_content
set content = jsonb_set(
  content,
  '{invite,whatsappTemplates}',
  (
    select coalesce(
      jsonb_agg(
        case
          when tmpl->>'id' = 'formal-kristen'
            or coalesce(tmpl->>'message', '') like 'Shalom,%'
            or coalesce(tmpl->>'message', '') like '%mengucap syukur kepada Tuhan Yesus Kristus%'
          then jsonb_build_object(
            'id', 'formal-kristen',
            'name', '1. Undangan Resmi',
            'message', $tpl$Kepada Yth.
Bapak/Ibu/Saudara/i
*{nama}*

Dengan senang hati kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan merayakan:

PESTA PERNIKAHAN {pasangan}

Informasi lengkap dapat dilihat melalui undangan digital berikut:

{link}

Dengan penuh kasih, kami menantikan kehadiran Bapak/Ibu/Saudara/i.

Salam hormat,
{pasangan}$tpl$
          )
          else tmpl
        end
        order by ordinality
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(content #> '{invite,whatsappTemplates}', '[]'::jsonb))
      with ordinality as t(tmpl, ordinality)
  )
)
where id = 'main'
  and content ? 'invite';
