-- Remove retired guestGuide (Info untuk Tamu) section from CMS content.
update site_content
set content = content - 'guestGuide'
where id = 'main'
  and content ? 'guestGuide';
