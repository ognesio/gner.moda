# GNER.MODA — site oficial

Site do acervo, projetos e referências do Gner, com painel administrativo para manter projetos e peças sem mexer no código.

- **Site**: React + Vite (arquivos estáticos), publicado no Netlify em `gnermoda.com`
- **Dados, login e fotos**: Supabase (banco Postgres + Auth + Storage)
- **Publicar um projeto ou mudar o status de uma peça vale na hora** — não precisa republicar o site

---

## 1. Configurar o Supabase (uma vez)

Projeto: `opktiobdvseegrrwmoje` → `https://opktiobdvseegrrwmoje.supabase.co`

1. **SQL Editor → New query**: cole e rode, **nesta ordem**, cada arquivo da pasta `supabase/`:
   1. `01_schema.sql` — tabelas
   2. `02_functions.sql` — gravação do painel (salva tudo de uma vez ou nada)
   3. `03_security.sql` — permissões (RLS) e o bucket de fotos `media`
   4. `04_seed.sql` — 48 peças do acervo (todas *Sob consulta*) + 1 projeto de teste

   Os três primeiros podem ser rodados de novo sem problema. O `04` roda uma vez só.

2. **Criar a conta de administrador**: *Authentication → Users → Add user → Create new user* (e-mail + senha, marque *Auto confirm*).

3. **Autorizar essa conta** (SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'EMAIL-DO-ADMIN';
   ```
   Estar logado não basta: só quem está nessa tabela edita o site. Para tirar o acesso: `delete from public.admins where user_id = (...)`.

4. **Fechar cadastro público**: *Authentication → Sign In / Providers* → desligue **Allow new users to sign up**.

5. **URL do site**: *Authentication → URL Configuration* → Site URL = `https://gnermoda.com`.

> A chave *publishable* (`sb_publishable_…`) fica no site — é pública por natureza; quem protege os dados são as regras do banco. A chave **secret/service_role nunca** deve ir para o código nem para o Netlify.

---

## 2. Publicar no Netlify

O site usa uma **Edge Function** (prévia correta de links no WhatsApp). Por isso o deploy precisa ser por **Git** ou **Netlify CLI** — arrastar a pasta `dist` no painel do Netlify **não** publica a função.

**Opção A — GitHub (recomendada, publica sozinho a cada alteração de código):**
1. Suba esta pasta para um repositório no GitHub.
2. Netlify → *Add new site → Import an existing project* → escolha o repositório. As configurações vêm do `netlify.toml` (build `npm run build`, pasta `dist`).
3. *Domain management* → adicione `gnermoda.com` e siga as instruções de DNS. HTTPS é automático.

**Opção B — linha de comando:**
```bash
npm install
npx netlify-cli deploy --build --prod
```

Variáveis de ambiente são **opcionais** (os valores padrão estão em `src/config/site.ts`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## 3. Rodar no computador

```bash
npm install
npm run dev        # http://localhost:5173 (usa o Supabase real)
npm run build      # gera a pasta dist/
npm run preview    # testa o build
```

---

## 4. Usar o painel — `gnermoda.com/admin`

### Projetos & Cases
- **+ Novo projeto** → preencha nome (a URL é gerada sozinha), artista, stylist, categoria, ano, descrição curta e descritivo.
- **Galeria**: arraste várias fotos de uma vez. Elas são reduzidas no navegador (até 2000 px, WebP) antes de subir. Arraste as miniaturas para ordenar, **★ Definir capa**, **Trocar**, **Remover**, texto alternativo e legenda.
- **Créditos**: quantas linhas *Função + Nome* quiser. Linhas vazias não aparecem.
- **Peças do acervo**: busque por nome ou código (`GM-0012`) e adicione. O vínculo aparece nos dois sentidos: no projeto (“Peças usadas”) e na peça (“Aparece em”).
- **Salvar rascunho** (fica fora do site) → **Pré-visualizar** (abre a página real com faixa de prévia, só para admin) → **Publicar**.
- **Despublicar** volta para rascunho. **Arquivar** tira do site sem apagar nada; dá para **Restaurar**.
- Na lista: ★ = destaque na Home; arraste as linhas (⋮⋮) para mudar a ordem no site.
- Só é obrigatório: nome, URL e (para publicar) uma foto. Campo vazio não aparece no site.

### Acervo
- **Mudar status**: na lista, troque o seletor (Disponível / Sob consulta / Reservada / Alugada). Vale na hora.
  - *Reservada* e *Alugada* = indisponível: a peça continua no site com o selo e o botão “Avisar quando voltar”.
- **Editar peça**: tamanhos (marque todos que ela veste — ex.: M e G), cores, tecido, descrição, medidas, condição, valor, fotos.
- **Nova peça**: o código `GM-00xx` é gerado ao salvar e nunca muda.
- **Mostrar no site** desmarcado = peça escondida (não é apagada). Peça usada em projeto não pode ser excluída.

---

## 5. Ajustes comuns no código

| O quê | Onde |
|---|---|
| Logo | Troque `public/logo.svg` (mesmo nome). No rodapé ele aparece invertido (branco). |
| WhatsApp, e-mail, Instagram, domínio | `src/config/site.ts` (e `SITE` em `netlify/edge-functions/og.ts`) |
| Textos fixos (Home, Sobre mim, Referências, Contato) | `src/data/content.ts` |
| Fotos fixas (Home, Sobre mim, Referências) | `public/static/...` + referências em `src/data/content.ts` |
| Cores e tipografia | variáveis no topo de `src/styles/global.css` |

Mensagem do WhatsApp (botão da peça): *“Olá, Gner! Tenho interesse em consultar a disponibilidade da peça [NOME], código [CÓDIGO], tamanho [TAMANHO]. Encontrei a peça no seu site: [LINK]”* + nome e datas, se preenchidos.

---

## 6. Estrutura

```
supabase/            SQL do banco (rodar no Supabase) + dados iniciais
src/config/site.ts   contatos e chaves públicas
src/data/content.ts  textos fixos do site
src/pages/           páginas públicas
src/admin/           painel (carregado só em /admin)
src/lib/             acesso a dados, formatação, WhatsApp
netlify/edge-functions/og.ts   prévia de links (WhatsApp/Instagram)
public/static/       fotos iniciais otimizadas (WebP + JPG para prévias)
tests/               testes locais (não vão para o site)
```

### Banco de dados
`pieces`, `piece_images`, `projects`, `project_images` (ordem + capa), `project_credits`, `project_pieces` (projeto ↔ peça), `project_image_pieces` (preparado para marcar peças dentro de uma foto, ainda sem interface), `admins`.

---

## 7. Testes

`tests/` contém um servidor local que imita as rotas do Supabase sobre um Postgres real (mesmas regras de RLS) e um teste de ponta a ponta com Playwright cobrindo: login → novo projeto → créditos → upload → capa → ordem → peças → rascunho → prévia → publicar → galeria pública → URL → créditos → ordem das fotos → vínculos nos dois sentidos → editar → remover foto (apaga do Storage) → despublicar → arquivar → status da peça → WhatsApp → conta sem permissão.

Depois do deploy, repita o mesmo roteiro no Supabase real (seção 4).
