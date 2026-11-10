-- =====================================================================
-- GNER.MODA — 04 · Conteúdo inicial: 48 peças do acervo + 1 projeto de teste
-- Rode UMA vez, depois dos arquivos 01, 02 e 03. As fotos iniciais ficam no próprio
-- site (/static/...); fotos novas enviadas pelo painel vão para o Storage.
-- =====================================================================

insert into public.pieces (code, slug, name, category, sizes, colors, materials, status, sort_order) values
  ('GM-0001', 'boina-francesa-gm-0001', 'Boina Francesa', 'acessorios', '{"M"}', '{"Preto"}', '{}', 'sob_consulta', 501),
  ('GM-0002', 'bone-militar-vintage-distressed-gm-0002', 'Boné Militar Vintage Distressed', 'acessorios', '{}', '{}', '{}', 'sob_consulta', 502),
  ('GM-0003', 'bone-com-estampa-de-caveira-gm-0003', 'Boné com Estampa de Caveira', 'acessorios', '{}', '{}', '{}', 'sob_consulta', 503),
  ('GM-0004', 'luva-invictus-gm-0004', 'Luva Invictus', 'acessorios', '{"M"}', '{"Preto"}', '{}', 'sob_consulta', 504),
  ('GM-0005', 'luvas-taticas-sem-dedos-gm-0005', 'Luvas Táticas sem Dedos', 'acessorios', '{}', '{"Preto"}', '{}', 'sob_consulta', 505),
  ('GM-0006', 'oculos-oakley-gm-0006', 'Óculos Oakley', 'acessorios', '{}', '{"Preto"}', '{}', 'sob_consulta', 506),
  ('GM-0007', 'bota-timberland-gm-0007', 'Bota Timberland', 'calcados', '{"43"}', '{"Bege"}', '{}', 'sob_consulta', 407),
  ('GM-0008', 'tenis-adidas-adifom-superstar-gm-0008', 'Tênis Adidas Adifom Superstar', 'calcados', '{"43"}', '{"Preto"}', '{}', 'sob_consulta', 408),
  ('GM-0009', 'tenis-adidas-samba-x-kader-gm-0009', 'Tênis Adidas Samba x Kader', 'calcados', '{"43"}', '{"Marrom"}', '{}', 'sob_consulta', 409),
  ('GM-0010', 'tenis-diesel-x-melissa-gm-0010', 'Tênis Diesel x Melissa', 'calcados', '{"43"}', '{"Preto"}', '{}', 'sob_consulta', 410),
  ('GM-0011', 'tenis-jordan-heir-series-gm-0011', 'Tênis Jordan Heir Series', 'calcados', '{"43"}', '{"Branco"}', '{}', 'sob_consulta', 411),
  ('GM-0012', 'tenis-puma-palermo-sonserina-gm-0012', 'Tênis Puma Palermo Sonserina', 'calcados', '{"43"}', '{"Verde"}', '{}', 'sob_consulta', 412),
  ('GM-0013', 'conjunto-camisa-e-calca-gm-0013', 'Conjunto Camisa e Calça', 'conjuntos', '{}', '{"Creme"}', '{}', 'sob_consulta', 313),
  ('GM-0014', 'conjunto-manga-curta-gm-0014', 'Conjunto Manga Curta', 'conjuntos', '{"M"}', '{"Bege"}', '{}', 'sob_consulta', 314),
  ('GM-0015', 'macacao-gm-0015', 'Macacão', 'conjuntos', '{"M","G"}', '{"Preto"}', '{}', 'sob_consulta', 315),
  ('GM-0016', 'casaco-de-pele-gm-0016', 'Casaco de Pele', 'externas', '{}', '{"Vermelho"}', '{"Pele"}', 'sob_consulta', 16),
  ('GM-0017', 'jaqueta-gm-0017', 'Jaqueta', 'externas', '{"M","G"}', '{"Branco"}', '{}', 'sob_consulta', 17),
  ('GM-0018', 'jaqueta-de-couro-gm-0018', 'Jaqueta de Couro', 'externas', '{"G","GG"}', '{"Preto"}', '{"Couro"}', 'sob_consulta', 18),
  ('GM-0019', 'bermuda-cargo-camo-design-by-me-gm-0019', 'Bermuda Cargo Camo Design.by.me', 'inferior', '{"G"}', '{"Verde"}', '{}', 'sob_consulta', 219),
  ('GM-0020', 'bermuda-de-couro-design-by-me-gm-0020', 'Bermuda de Couro Design.by.me', 'inferior', '{}', '{}', '{"Couro"}', 'sob_consulta', 220),
  ('GM-0021', 'calca-cargo-de-couro-gm-0021', 'Calça Cargo de Couro', 'inferior', '{}', '{"Marrom"}', '{"Couro"}', 'sob_consulta', 221),
  ('GM-0022', 'calca-jeans-customizada-chamas-gm-0022', 'Calça Jeans Customizada Chamas', 'inferior', '{}', '{}', '{"Jeans"}', 'sob_consulta', 222),
  ('GM-0023', 'calca-jeans-design-by-me-gm-0023', 'Calça Jeans Design.by.me', 'inferior', '{"M","G"}', '{}', '{"Jeans"}', 'sob_consulta', 223),
  ('GM-0024', 'calca-jeans-flare-design-by-me-gm-0024', 'Calça Jeans Flare Design.by.me', 'inferior', '{"M","G"}', '{}', '{"Jeans"}', 'sob_consulta', 224),
  ('GM-0025', 'calca-jeans-workwear-gm-0025', 'Calça Jeans Workwear', 'inferior', '{"G"}', '{"Vermelho"}', '{"Jeans"}', 'sob_consulta', 225),
  ('GM-0026', 'calca-pantalona-toile-gm-0026', 'Calça Pantalona Toile', 'inferior', '{}', '{"Azul"}', '{}', 'sob_consulta', 226),
  ('GM-0027', 'calca-de-couro-gm-0027', 'Calça de Couro', 'inferior', '{"M","G"}', '{"Branco"}', '{"Couro"}', 'sob_consulta', 227),
  ('GM-0028', 'calca-de-couro-reta-gm-0028', 'Calça de Couro Reta', 'inferior', '{"M","G"}', '{"Preto"}', '{"Couro"}', 'sob_consulta', 228),
  ('GM-0029', 'jorts-jeans-gm-0029', 'Jorts Jeans', 'inferior', '{"G"}', '{"Azul escuro"}', '{"Jeans"}', 'sob_consulta', 229),
  ('GM-0030', 'blazer-sem-manga-gm-0030', 'Blazer sem Manga', 'superior', '{"M"}', '{"Marrom"}', '{}', 'sob_consulta', 130),
  ('GM-0031', 'blazer-sem-manga-gm-0031', 'Blazer sem Manga', 'superior', '{"M","G"}', '{"Preto"}', '{}', 'sob_consulta', 131),
  ('GM-0032', 'camisa-texturizada-com-babados-gm-0032', 'Camisa Texturizada com Babados', 'superior', '{}', '{"Preto"}', '{}', 'sob_consulta', 132),
  ('GM-0033', 'camisa-de-botoes-gm-0033', 'Camisa de Botões', 'superior', '{}', '{"Cáqui"}', '{}', 'sob_consulta', 133),
  ('GM-0034', 'camisa-sem-mangas-gm-0034', 'Camisa sem Mangas', 'superior', '{}', '{"Vermelho"}', '{}', 'sob_consulta', 134),
  ('GM-0035', 'camiseta-oversized-com-tiras-e-ilhos-gm-0035', 'Camiseta Oversized com Tiras e Ilhós', 'superior', '{}', '{"Vinho"}', '{}', 'sob_consulta', 135),
  ('GM-0036', 'colete-jeans-gm-0036', 'Colete Jeans', 'superior', '{"G"}', '{}', '{"Jeans"}', 'sob_consulta', 136),
  ('GM-0037', 'colete-jeans-personalizado-gm-0037', 'Colete Jeans Personalizado', 'superior', '{"P"}', '{}', '{"Jeans"}', 'sob_consulta', 137),
  ('GM-0038', 'colete-social-risca-de-giz-gm-0038', 'Colete Social Risca de Giz', 'superior', '{"P"}', '{"Preto"}', '{}', 'sob_consulta', 138),
  ('GM-0039', 'colete-utilitario-gm-0039', 'Colete Utilitário', 'superior', '{"M"}', '{"Bege"}', '{}', 'sob_consulta', 139),
  ('GM-0040', 'colete-de-couro-gm-0040', 'Colete de Couro', 'superior', '{"G"}', '{"Preto"}', '{"Couro"}', 'sob_consulta', 140),
  ('GM-0041', 'colete-de-couro-crocodilo-gm-0041', 'Colete de Couro Crocodilo', 'superior', '{}', '{}', '{"Couro"}', 'sob_consulta', 141),
  ('GM-0042', 'colete-de-pelo-leopardo-gm-0042', 'Colete de Pelo Leopardo', 'superior', '{}', '{"Leopardo"}', '{"Pelo sintético"}', 'sob_consulta', 142),
  ('GM-0043', 'colete-de-trico-gm-0043', 'Colete de Tricô', 'superior', '{}', '{"Preto"}', '{"Tricô"}', 'sob_consulta', 143),
  ('GM-0044', 'colete-de-trico-decote-v-gm-0044', 'Colete de Tricô Decote V', 'superior', '{}', '{"Marfim"}', '{"Tricô"}', 'sob_consulta', 144),
  ('GM-0045', 'colete-de-trico-giardino-gm-0045', 'Colete de Tricô Giardino', 'superior', '{}', '{"Vinho"}', '{"Tricô"}', 'sob_consulta', 145),
  ('GM-0046', 'regata-canelada-gm-0046', 'Regata Canelada', 'superior', '{}', '{"Preto"}', '{"Canelado"}', 'sob_consulta', 146),
  ('GM-0047', 'regata-esportiva-brasil-pavtros-gm-0047', 'Regata Esportiva Brasil PAVTROS', 'superior', '{}', '{"Amarelo"}', '{}', 'sob_consulta', 147),
  ('GM-0048', 'camisa-dragao-gm-0048', 'Camisa Dragão', 'superior', '{"G"}', '{}', '{}', 'sob_consulta', 148)
on conflict (code) do nothing;

select setval('public.piece_code_seq', greatest((select max(substr(code,4)::int) from public.pieces), 1));

insert into public.piece_images (piece_id, path, thumb, width, height, alt, position)
select p.id, v.path, v.thumb, v.w, v.h, p.name, 0
  from (values
    ('GM-0001', '/static/acervo/gm-0001.webp', '/static/acervo/gm-0001-sm.webp', 498, 500),
    ('GM-0002', '/static/acervo/gm-0002.webp', '/static/acervo/gm-0002-sm.webp', 1254, 1254),
    ('GM-0003', '/static/acervo/gm-0003.webp', '/static/acervo/gm-0003-sm.webp', 1363, 1154),
    ('GM-0004', '/static/acervo/gm-0004.webp', '/static/acervo/gm-0004-sm.webp', 800, 1006),
    ('GM-0005', '/static/acervo/gm-0005.webp', '/static/acervo/gm-0005-sm.webp', 1536, 1024),
    ('GM-0006', '/static/acervo/gm-0006.webp', '/static/acervo/gm-0006-sm.webp', 1201, 1201),
    ('GM-0007', '/static/acervo/gm-0007.webp', '/static/acervo/gm-0007-sm.webp', 498, 401),
    ('GM-0008', '/static/acervo/gm-0008.webp', '/static/acervo/gm-0008-sm.webp', 447, 447),
    ('GM-0009', '/static/acervo/gm-0009.webp', '/static/acervo/gm-0009-sm.webp', 1000, 1334),
    ('GM-0010', '/static/acervo/gm-0010.webp', '/static/acervo/gm-0010-sm.webp', 600, 800),
    ('GM-0011', '/static/acervo/gm-0011.webp', '/static/acervo/gm-0011-sm.webp', 1000, 1000),
    ('GM-0012', '/static/acervo/gm-0012.webp', '/static/acervo/gm-0012-sm.webp', 1600, 1600),
    ('GM-0013', '/static/acervo/gm-0013.webp', '/static/acervo/gm-0013-sm.webp', 1122, 1402),
    ('GM-0014', '/static/acervo/gm-0014.webp', '/static/acervo/gm-0014-sm.webp', 1179, 1171),
    ('GM-0015', '/static/acervo/gm-0015.webp', '/static/acervo/gm-0015-sm.webp', 1086, 1448),
    ('GM-0016', '/static/acervo/gm-0016.webp', '/static/acervo/gm-0016-sm.webp', 1145, 1374),
    ('GM-0017', '/static/acervo/gm-0017.webp', '/static/acervo/gm-0017-sm.webp', 1122, 1402),
    ('GM-0018', '/static/acervo/gm-0018.webp', '/static/acervo/gm-0018-sm.webp', 1122, 1402),
    ('GM-0019', '/static/acervo/gm-0019.webp', '/static/acervo/gm-0019-sm.webp', 1195, 1316),
    ('GM-0020', '/static/acervo/gm-0020.webp', '/static/acervo/gm-0020-sm.webp', 1316, 1195),
    ('GM-0021', '/static/acervo/gm-0021.webp', '/static/acervo/gm-0021-sm.webp', 1146, 1372),
    ('GM-0022', '/static/acervo/gm-0022.webp', '/static/acervo/gm-0022-sm.webp', 1254, 1254),
    ('GM-0023', '/static/acervo/gm-0023.webp', '/static/acervo/gm-0023-sm.webp', 1086, 1448),
    ('GM-0024', '/static/acervo/gm-0024.webp', '/static/acervo/gm-0024-sm.webp', 1122, 1402),
    ('GM-0025', '/static/acervo/gm-0025.webp', '/static/acervo/gm-0025-sm.webp', 1179, 1132),
    ('GM-0026', '/static/acervo/gm-0026.webp', '/static/acervo/gm-0026-sm.webp', 1254, 1254),
    ('GM-0027', '/static/acervo/gm-0027.webp', '/static/acervo/gm-0027-sm.webp', 1179, 1270),
    ('GM-0028', '/static/acervo/gm-0028.webp', '/static/acervo/gm-0028-sm.webp', 1179, 1118),
    ('GM-0029', '/static/acervo/gm-0029.webp', '/static/acervo/gm-0029-sm.webp', 1122, 1402),
    ('GM-0030', '/static/acervo/gm-0030.webp', '/static/acervo/gm-0030-sm.webp', 1122, 1402),
    ('GM-0031', '/static/acervo/gm-0031.webp', '/static/acervo/gm-0031-sm.webp', 1122, 1402),
    ('GM-0032', '/static/acervo/gm-0032.webp', '/static/acervo/gm-0032-sm.webp', 1196, 1315),
    ('GM-0033', '/static/acervo/gm-0033.webp', '/static/acervo/gm-0033-sm.webp', 1122, 1402),
    ('GM-0034', '/static/acervo/gm-0034.webp', '/static/acervo/gm-0034-sm.webp', 1197, 1315),
    ('GM-0035', '/static/acervo/gm-0035.webp', '/static/acervo/gm-0035-sm.webp', 1254, 1254),
    ('GM-0036', '/static/acervo/gm-0036.webp', '/static/acervo/gm-0036-sm.webp', 1195, 1316),
    ('GM-0037', '/static/acervo/gm-0037.webp', '/static/acervo/gm-0037-sm.webp', 1195, 1316),
    ('GM-0038', '/static/acervo/gm-0038.webp', '/static/acervo/gm-0038-sm.webp', 1122, 1402),
    ('GM-0039', '/static/acervo/gm-0039.webp', '/static/acervo/gm-0039-sm.webp', 1195, 1316),
    ('GM-0040', '/static/acervo/gm-0040.webp', '/static/acervo/gm-0040-sm.webp', 1122, 1402),
    ('GM-0041', '/static/acervo/gm-0041.webp', '/static/acervo/gm-0041-sm.webp', 1145, 1374),
    ('GM-0042', '/static/acervo/gm-0042.webp', '/static/acervo/gm-0042-sm.webp', 1145, 1374),
    ('GM-0043', '/static/acervo/gm-0043.webp', '/static/acervo/gm-0043-sm.webp', 1122, 1402),
    ('GM-0044', '/static/acervo/gm-0044.webp', '/static/acervo/gm-0044-sm.webp', 1254, 1254),
    ('GM-0045', '/static/acervo/gm-0045.webp', '/static/acervo/gm-0045-sm.webp', 1144, 1375),
    ('GM-0046', '/static/acervo/gm-0046.webp', '/static/acervo/gm-0046-sm.webp', 1024, 1536),
    ('GM-0047', '/static/acervo/gm-0047.webp', '/static/acervo/gm-0047-sm.webp', 1194, 1317),
    ('GM-0048', '/static/acervo/gm-0048.webp', '/static/acervo/gm-0048-sm.webp', 1197, 1314)
  ) as v(code, path, thumb, w, h)
  join public.pieces p on p.code = v.code
 where not exists (select 1 from public.piece_images x where x.piece_id = p.id);

-- ---------- Projeto de teste (pode ser arquivado ou editado pelo painel) ----------
do $$
declare v uuid;
begin
  if exists (select 1 from public.projects where slug = 'projeto-teste') then return; end if;
  insert into public.projects (slug, title, artist, stylist, short_description, body, category,
                               project_date, status, sort_order, featured_home, is_test)
  values ('projeto-teste', 'Projeto Teste', 'Artista (exemplo)', 'Gner',
          'Projeto de demonstração para validar o painel e a página pública.',
          'Este é um projeto de teste. Os textos, créditos e peças vinculadas são provisórios e servem apenas para conferir o funcionamento do site. Substitua o conteúdo ou arquive este projeto pelo painel administrativo.',
          'Editorial', '2026', 'published', 0, true, true)
  returning id into v;
  insert into public.project_images (project_id, path, thumb, width, height, alt, position, is_cover) values
    (v, '/static/gner/img-6982.webp', '/static/gner/img-6982-sm.webp', 1333, 2000, 'Gner — foto 1 do projeto teste', 0, true),
    (v, '/static/gner/img-9481.webp', '/static/gner/img-9481-sm.webp', 1333, 2000, 'Gner — foto 2 do projeto teste', 1, false),
    (v, '/static/gner/img-9614.webp', '/static/gner/img-9614-sm.webp', 1333, 2000, 'Gner — foto 3 do projeto teste', 2, false),
    (v, '/static/gner/img-0126.webp', '/static/gner/img-0126-sm.webp', 1125, 2000, 'Gner — foto 4 do projeto teste', 3, false);
  insert into public.project_credits (project_id, name, role, position) values
    (v, 'Nome do fotógrafo (exemplo)', 'Fotografia', 0),
    (v, 'Nome do maquiador (exemplo)', 'Beleza', 1);
  insert into public.project_pieces (project_id, piece_id, position)
  select v, p.id, row_number() over (order by p.code) - 1
    from public.pieces p where p.code in ('GM-0001','GM-0021','GM-0030');
end $$;
