-- Drop CMS overrides that diverge from GW5 gift/footer copy.
-- Defaults in wedding.config.ts already match GW5.
update site_content
set content = (content #- '{gift,description}') - 'closing'
where id = 'main';
