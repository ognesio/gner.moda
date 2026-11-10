// =====================================================================
// Configurações gerais do site — edite aqui contato, redes e Supabase.
// =====================================================================

export const site = {
  name: 'GNER.MODA',
  domain: 'https://gnermoda.com',
  email: 'contato@gnermoda.com',
  instagram: 'gner.moda',
  // Só números, com DDI 55 + DDD. Exibição formatada logo abaixo.
  whatsapp: '5511941453472',
  whatsappLabel: '(11) 94145-3472',
  description:
    'GNER.MODA é um acervo de moda, pesquisa e criação. Reúne direção de estilo, projetos autorais, referências e um acervo de peças para produções, editoriais e experimentações visuais.',
}

// Chaves públicas do Supabase (podem ficar no site; a segurança está nas regras do banco).
// Podem ser sobrescritas por variáveis de ambiente no Netlify.
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://opktiobdvseegrrwmoje.supabase.co',
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LDxZEEjTwi_ZZp3eZKbbOw_YcTaZuOn',
  bucket: 'media',
}
