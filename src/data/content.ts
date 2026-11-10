// Textos fixos do site — conforme o documento TX_SITE_GNERMODA (não editar o sentido).

export const home = {
  apresentacao:
    'GNER.MODA é um acervo de moda, pesquisa e criação. Reúne direção de estilo, projetos autorais, referências e um acervo de peças para produções, editoriais e experimentações visuais.',
  sobreResumo:
    'GNER.MODA é um arquivo vivo de moda e expressão visual. Entre peças, projetos e referências, o acervo se constrói através da pesquisa, da experimentação e de um olhar autoral sobre estilo e identidade.',
}

export const acervo = {
  abertura: 'Seleção de peças do acervo GNER.MODA disponíveis para locação, produções e editoriais.',
  vazio: 'Nenhuma peça com esses filtros. Limpe um filtro para ver mais.',
  regras: 'Retirada e devolução combinadas com o Gner. Sinal e caução a definir.',
  semCheckout: 'Sem checkout: o Gner recebe o pedido e confirma a disponibilidade com você.',
}

export const projetos = {
  abertura: 'Produções, editoriais e colaborações desenvolvidas por GNER.MODA.',
}

export const referenciasAbertura =
  'Imagens, perfis e materiais que alimentam o repertório e a pesquisa do GNER.MODA.'

// Legendas não foram fornecidas; @Ludolf ainda sem imagem.
export const referencias: { handle: string; url?: string; image?: string; w?: number; h?: number; caption?: string }[] = [
  { handle: '@Futurist__', url: 'https://instagram.com/futurist__', image: '/static/referencias/futurist-3', w: 1600, h: 1067 },
  { handle: '@Ludolf' },
  { handle: '@Tobias', url: 'https://instagram.com/tobiasnabor', image: '/static/referencias/tobiasnabor-4', w: 1200, h: 1600 },
  { handle: '@Tylerthecreator', url: 'https://instagram.com/feliciathegoat', image: '/static/referencias/feliciathegoat-1', w: 1280, h: 1600 },
]

export const contato = {
  abertura: 'Parcerias, colaborações e dúvidas sobre locação.',
}

export const sobreMim = {
  titulo: 'Sobre mim',
  subtitulo: 'Entre identidade, expressão e moda.',
  paragrafos: [
    'Acredito na moda como uma forma de arte, expressão e construção de identidade. Mais do que vestir o corpo, enxergo nas roupas a possibilidade de contar histórias, explorar diferentes versões de mim mesmo e comunicar aquilo que nem sempre pode ser traduzido em palavras. Meu trabalho nasce desse olhar: da vontade de transformar referências culturais, experiências pessoais e escolhas estéticas em uma linguagem própria. Entre o maximalismo, a experimentação e a liberdade criativa, busco desafiar convenções e explorar a moda para além de sua função tradicional.',
    'Nascido em 2004 e criado na Zona Leste de São Paulo, encontrei na maneira de me vestir uma das minhas primeiras formas de expressão individual. Desde a infância, demonstrava interesse por composições que fugiam do convencional, mesmo em um ambiente familiar conservador, no qual minhas escolhas nem sempre eram compreendidas. Com o tempo, aquilo que inicialmente despertava estranhamento se tornou parte fundamental da minha identidade e da maneira como me relaciono com o mundo.',
    'Minha aproximação com a moda enquanto manifestação artística aconteceu por meio da música e da cultura visual. Observar artistas que utilizavam o vestuário como extensão de suas performances despertou minha curiosidade sobre o poder comunicativo das roupas. Posteriormente, o contato com produções e eventos como o Met Gala ampliou esse interesse, revelando um universo em que moda, arte e conceito se encontram. Durante o ensino médio, essa percepção se refletiu diretamente no meu estilo, que passou de composições mais básicas para experimentações maximalistas, marcadas por silhuetas, texturas e combinações pouco convencionais.',
    'Essa trajetória também foi atravessada por experiências pessoais que moldaram minha percepção sobre a estética e a sociedade. Como homem negro, compreendo que a maneira como nos vestimos carrega significados que ultrapassam nossas intenções individuais. A moda, para mim, também representa a possibilidade de questionar expectativas, ocupar espaços e reafirmar identidades. Ao longo desse processo, percebi como uma escolha estética pode transformar olhares, estimular conversas e aproximar pessoas de realidades e linguagens diferentes.',
    'Meu repertório criativo é construído a partir de múltiplas influências. Encontro inspiração na arquitetura, nas artes visuais, na história e, especialmente, na música, transitando entre gêneros como jazz, blues, MPB, house e música eletrônica. Essas referências alimentam minha pesquisa estética e influenciam a maneira como interpreto formas, proporções, movimentos e narrativas. Não me interessa apenas acompanhar tendências, mas compreender suas origens, seus significados e as possibilidades de reinterpretá-las.',
    '*Costumo dizer que eu visto a roupa e a roupa me veste.* Acredito que cada composição carrega uma personalidade e pode transformar não apenas a imagem que projetamos, mas também nossa postura, nossos gestos e a maneira como nos percebemos. Vestir-se é, de certa forma, interpretar personagens, experimentar novas presenças e descobrir possibilidades de existir.',
    'Hoje, busco transformar essa relação com a moda em uma trajetória profissional que conecte criação, pesquisa e direção estética. Meu objetivo é desenvolver projetos como stylist, colaborar com artistas e marcas, explorar o universo editorial e ampliar minha presença em produções e passarelas. A longo prazo, desejo construir minha própria marca e atuar na direção criativa, desenvolvendo conceitos e narrativas que expressem minha visão sobre a moda contemporânea.',
    'O *GNER.MODA* nasce como uma extensão desse percurso. Mais do que um portfólio, é um espaço dedicado à construção de uma identidade criativa, à experimentação estética e ao compartilhamento de referências, projetos e interpretações pessoais. Um universo em constante transformação, que reúne aquilo que me inspira, o que acredito e tudo o que ainda desejo criar.',
  ],
  fecho: 'Porque, para mim, *a roupa nunca é apenas roupa.*',
}

export const fotos = {
  hero: { src: '/static/gner/img-0126', w: 1125, h: 2000, alt: 'Gner de casaco vermelho longo diante de uma porta de aço' },
  sobre: [
    { src: '/static/gner/foto-sobremim-pref01', w: 1500, h: 2000, alt: 'Gner encostado em parede de madeira com quadros' },
    { src: '/static/gner/img-9481', w: 1333, h: 2000, alt: 'Gner de calça branca em frente a portão com hera' },
    { src: '/static/gner/img-0317', w: 1123, h: 2000, alt: 'Gner de camisa branca, gravata listrada e boina em estúdio' },
    { src: '/static/gner/img-9595', w: 1500, h: 2000, alt: 'Gner deitado no chão de pedra com calça estampada' },
  ],
}
