import sys
from playwright.sync_api import sync_playwright
B='http://localhost:4173'
pages=[('home','/'),('acervo','/acervo'),('peca','/acervo/jaqueta-de-couro-gm-0018'),('projetos','/projetos'),('projeto','/projetos/projeto-teste'),('sobre','/sobre-mim'),('referencias','/referencias'),('contato','/contato'),('404','/nada')]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':1440,'height':900})
    errs=[]; pg.on('console', lambda m: m.type=='error' and errs.append(m.text)); pg.on('pageerror', lambda e: errs.append(str(e)))
    for n,u in pages:
        pg.goto(B+u); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(400)
        pg.screenshot(path=f'/tmp/shots/{n}.png', full_page=(n in sys.argv[1:]))
    m=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    for n,u in [('m-home','/'),('m-acervo','/acervo'),('m-peca','/acervo/jaqueta-de-couro-gm-0018')]:
        m.goto(B+u); m.wait_for_load_state('networkidle'); m.wait_for_timeout(400); m.screenshot(path=f'/tmp/shots/{n}.png', full_page=True)
    print('ERRORS:',errs)
    b.close()
