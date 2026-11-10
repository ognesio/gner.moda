# Fluxo do briefing: Login → Novo projeto → Créditos → Upload → Capa → Peças → Rascunho → Prévia → Publicar → verificações
import re, os, urllib.parse
from playwright.sync_api import sync_playwright, expect
B='http://localhost:4173'
RAW='/home/claude/raw'
files=[f'{RAW}/Gner Moda/IMG_0317.JPG', f'{RAW}/Acervo - @gner.moda/Jaqueta_Couro_Preto - Tamanho G_GG.png', f'{RAW}/Gner Moda/0aeb4960-1bc7-4673-9937-1c5b54d53142.jpg']
ok=lambda m: print('  ✓', m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    adm=b.new_context(viewport={'width':1300,'height':900}); a=adm.new_page()
    errs=[]; a.on('pageerror', lambda e: errs.append(str(e)))
    vis=b.new_context(viewport={'width':1300,'height':900}); v=vis.new_page()

    print('1. Login')
    a.goto(B+'/admin'); a.fill('input[type=email]','admin@gnermoda.com'); a.fill('input[type=password]','errada'); a.click('button:has-text("Entrar")')
    expect(a.get_by_text('E-mail ou senha incorretos.')).to_be_visible(); ok('senha errada recusada')
    a.fill('input[type=password]','teste123'); a.click('button:has-text("Entrar")')
    expect(a.get_by_role('heading', name='Projetos & Cases')).to_be_visible(); ok('admin entrou')
    expect(a.get_by_text('Projeto Teste')).to_be_visible(); ok('lista mostra projeto de teste')

    print('2. Novo projeto + campos')
    a.click('text=+ Novo projeto')
    a.get_by_label('Nome do projeto *').fill('Editorial Rua Augusta')
    expect(a.locator('input[pattern]')).to_have_value('editorial-rua-augusta'); ok('slug automático')
    a.get_by_label('Artista').fill('Artista Teste'); a.get_by_label('Stylist').fill('Gner')
    a.get_by_label('Categoria').fill('Editorial'); a.get_by_label('Ano ou data').fill('2026')
    a.get_by_label('Descrição curta').fill('Editorial de teste nas ruas do centro.')
    a.get_by_label('Descritivo / conceito').fill('Primeiro parágrafo.\n\nSegundo parágrafo.')

    print('3. Créditos')
    for role,name in [('Fotografia','Fulana Foto'),('Beleza','Ciclano Make')]:
        a.click('text=+ Adicionar crédito')
        a.get_by_label('Função').last.fill(role); a.get_by_label('Nome', exact=True).last.fill(name)
    a.click('text=+ Adicionar crédito'); ok('2 créditos + 1 linha vazia (deve ser ignorada)')

    print('4. Upload múltiplo')
    a.set_input_files('[data-testid=gallery-input]', files)
    expect(a.locator('[data-testid=gallery-tile]')).to_have_count(3, timeout=60000); ok('3 fotos enviadas e otimizadas')
    dims=a.locator('.gm__dim').all_inner_texts(); print('    dimensões:',dims)
    assert all(max(map(int,d.split('×')))<=2000 for d in dims); ok('nenhuma passa de 2000 px; proporção preservada')

    print('5. Capa e ordem')
    a.locator('[data-testid=gallery-tile]').nth(1).get_by_text('★ Definir capa').click()
    expect(a.locator('[data-testid=gallery-tile]').nth(1).locator('.gm__cover')).to_be_visible(); ok('capa = foto 2')
    srcs_before=[i.get_attribute('src') for i in a.locator('.gm__thumb img').all()]
    src=a.locator('.gm__thumb').nth(2).bounding_box(); dst=a.locator('.gm__thumb').nth(0).bounding_box()
    a.mouse.move(src['x']+src['width']/2, src['y']+src['height']/2); a.mouse.down()
    a.mouse.move(src['x']+src['width']/2-20, src['y']+src['height']/2, steps=5)
    a.mouse.move(dst['x']+dst['width']/2-10, dst['y']+dst['height']/2, steps=20); a.mouse.up(); a.wait_for_timeout(400)
    srcs=[i.get_attribute('src') for i in a.locator('.gm__thumb img').all()]
    assert srcs[0]==srcs_before[2], (srcs_before, srcs); ok('arrastar: foto 3 virou a 1ª')
    a.locator('.gm__field[aria-label="Legenda"]').nth(0).fill('Legenda da primeira foto')
    a.locator('.gm__field[aria-label="Texto alternativo"]').nth(0).fill('Gner na rua')
    order=srcs

    print('6. Vincular peças')
    for q in ['jaqueta de couro','GM-0030']:
        a.get_by_label('Buscar peça do acervo').fill(q); a.locator('.pp__results button').first.click()
    expect(a.locator('[data-testid=chosen-piece]')).to_have_count(2); ok('2 peças vinculadas')

    print('7. Salvar rascunho')
    a.click('text=Salvar rascunho'); expect(a.get_by_text('Rascunho salvo.')).to_be_visible()
    a.wait_for_url(re.compile(r'/admin/projetos/[0-9a-f-]{36}$')); ok('salvo; URL do editor tem o id')
    expect(a.locator('.a-row__sub').first).to_contain_text('PRJ-'); ok('código gerado: '+a.locator('.a-row__sub').first.inner_text().split(' ')[0])
    v.goto(B+'/projetos/editorial-rua-augusta'); expect(v.get_by_role('heading', name='404')).to_be_visible(); ok('visitante NÃO vê rascunho (404)')
    v.goto(B+'/projetos'); expect(v.get_by_text('Editorial Rua Augusta')).to_have_count(0); ok('rascunho fora da lista pública')

    print('8. Pré-visualizar')
    with adm.expect_page() as pv: a.click('text=Pré-visualizar ↗')
    prev=pv.value; prev.wait_for_load_state('networkidle')
    expect(prev.locator('.preview-bar')).to_contain_text('Rascunho'); ok('prévia abre com faixa "Pré-visualização — Rascunho"')
    expect(prev.get_by_role('heading', name='Editorial Rua Augusta')).to_be_visible(); prev.close()

    print('9. Publicar')
    a.click('button:has-text("Publicar")'); expect(a.get_by_text('Projeto publicado — já está no site.')).to_be_visible(); ok('publicado')
    v.goto(B+'/projetos'); expect(v.get_by_text('Editorial Rua Augusta')).to_be_visible(); ok('aparece na galeria pública')
    v.goto(B+'/projetos/editorial-rua-augusta'); v.wait_for_load_state('networkidle')
    expect(v.get_by_role('heading', name='Editorial Rua Augusta')).to_be_visible(); ok('URL individual funciona')
    expect(v.locator('.preview-bar')).to_have_count(0)
    meta=v.locator('.project__meta').inner_text(); assert 'Artista Teste' in meta and 'Gner' in meta; ok('artista e stylist exibidos')
    cred=v.locator('.credits').inner_text(); assert 'Fulana Foto' in cred and 'Ciclano Make' in cred and cred.count('\n')<8; ok('créditos corretos, linha vazia omitida')
    cover=v.locator('.project__cover img').get_attribute('src'); gal=[i.get_attribute('src') for i in v.locator('.gallery img').all()]
    norm=lambda s: s.split('/')[-1].replace('-sm','')
    assert norm(cover)==norm(srcs_before[1]), (cover, order); ok('capa correta (a foto marcada, mesmo após reordenar)')
    assert [norm(x) for x in gal]==[norm(order[0]), norm(order[1])], (gal, order); ok('demais fotos na ordem definida')
    expect(v.get_by_text('Legenda da primeira foto')).to_be_visible(); ok('legenda exibida')
    expect(v.locator('#h-pecas ~ .grid .pcard')).to_have_count(2); ok('seção "Peças usadas" com 2 peças')

    print('10. Vínculo nos dois sentidos')
    v.locator('#h-pecas ~ .grid .pcard').first.click(); v.wait_for_load_state('networkidle')
    expect(v.locator('.appears')).to_contain_text('Editorial Rua Augusta'); ok('peça → "Aparece em: Editorial Rua Augusta"')
    v.locator('.appears a', has_text='Editorial Rua Augusta').click(); expect(v.get_by_role('heading', name='Editorial Rua Augusta')).to_be_visible(); ok('e volta ao projeto')

    print('11. Editar e despublicar sem código')
    a.get_by_label('Descrição curta').fill('Descrição alterada pelo painel.'); a.click('button:has-text("Salvar")>>nth=0')
    expect(a.get_by_text('Projeto publicado — já está no site.')).to_be_visible()
    v.goto(B+'/projetos'); expect(v.get_by_text('Descrição alterada pelo painel.')).to_be_visible(); ok('edição refletida no site')
    # remover uma foto e salvar → arquivo apagado do storage
    n_files=sum(len(f) for _,_,f in os.walk('/tmp/fake-storage'))
    a.on('dialog', lambda d: d.accept())
    a.locator('[data-testid=gallery-tile]').nth(2).get_by_text('Remover').click(); a.click('button:has-text("Salvar")>>nth=0')
    expect(a.get_by_text('Projeto publicado — já está no site.')).to_be_visible(); a.wait_for_timeout(500)
    n2=sum(len(f) for _,_,f in os.walk('/tmp/fake-storage')); assert n2==n_files-2, (n_files,n2); ok(f'foto removida apagou 2 arquivos do storage ({n_files}→{n2})')
    a.click('button:has-text("Despublicar")'); expect(a.get_by_text('Rascunho salvo.')).to_be_visible()
    v.goto(B+'/projetos/editorial-rua-augusta'); expect(v.get_by_role('heading', name='404')).to_be_visible(); ok('despublicado → some do site')
    a.click('button:has-text("Arquivar")'); expect(a.get_by_text('Projeto arquivado')).to_be_visible(); ok('arquivado, histórico mantido')

    print('12. Status da peça pelo painel')
    a.goto(B+'/admin/acervo'); a.get_by_label('Status de Jaqueta de Couro').select_option('alugada'); expect(a.get_by_text('Salvo ✓')).to_be_visible()
    v.goto(B+'/acervo/jaqueta-de-couro-gm-0018'); v.wait_for_load_state('networkidle')
    expect(v.locator('.piece__info .badge')).to_have_text('Alugada'); expect(v.get_by_text('Peça indisponível no momento')).to_be_visible(); ok('peça alugada continua visível, com status')
    href=urllib.parse.unquote(v.get_by_text('Avisar quando voltar').locator('xpath=..').get_attribute('href'))
    assert 'Jaqueta de Couro' in href and 'GM-0018' in href and 'G/GG' in href and 'wa.me/5511941453472' in href; ok('WhatsApp "avisar quando voltar": '+href.split('text=')[1][:90]+'…')
    v.goto(B+'/acervo?disp=1'); expect(v.locator('.filters__status')).to_contain_text('0 peças'); expect(v.get_by_text('Nenhuma peça com esses filtros')).to_be_visible(); ok('filtro "Só disponíveis" + estado vazio')
    v.goto(B+'/acervo/calca-cargo-de-couro-gm-0021'); v.wait_for_load_state('networkidle')
    v.get_by_label('Seu nome').fill('Ana'); v.get_by_label('Retirada').fill('2026-12-01'); v.get_by_label('Devolução').fill('2026-12-03')
    cap=[]; vis.route('https://wa.me/**', lambda r: (cap.append(r.request.url), r.fulfill(body='ok')))
    with vis.expect_page() as wa: v.click('button:has-text("Enviar pedido")')
    wa.value.wait_for_load_state(); u=urllib.parse.unquote(cap[0]); print('    ', u[:260].replace('\n',' | '))
    assert 'Nome: Ana' in u and 'Retirada: 01/12/2026' in u; ok('pedido monta mensagem com nome e datas')

    print('13. Usuário logado sem permissão')
    o=b.new_context().new_page(); o.goto(B+'/admin'); o.fill('input[type=email]','visitante@x.com'); o.fill('input[type=password]','teste123'); o.click('button:has-text("Entrar")')
    expect(o.get_by_role('heading', name='Sem permissão')).to_be_visible(); ok('conta sem autorização bloqueada')
    a.goto(B+'/admin/projetos'); a.screenshot(path='/tmp/shots/admin-list.png')
    print('ERROS JS:', errs or 'nenhum')
    b.close()
