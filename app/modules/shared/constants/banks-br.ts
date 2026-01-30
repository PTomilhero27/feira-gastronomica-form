/**
 * Lista de bancos do Brasil (mínimo viável).
 * Responsabilidade:
 * - Servir o autocomplete no formulário público
 *
 * Observação:
 * - Você pode crescer essa lista depois.
 */
export type BankItem = { code: string; name: string }

export const BANKS_BR: BankItem[] = [
  // Bancos tradicionais
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '389', name: 'Banco Mercantil do Brasil' },
  { code: '399', name: 'HSBC Brasil' }, // legado, mas ainda aparece em cadastros antigos
  { code: '422', name: 'Banco Safra' },
  { code: '453', name: 'Banco Rural (em liquidação)' },

  // Bancos digitais / fintechs
  { code: '260', name: 'Nu Pagamentos (Nubank)' },
  { code: '336', name: 'Banco C6' },
  { code: '077', name: 'Banco Inter' },
  { code: '655', name: 'Banco Votorantim (BV)' },
  { code: '212', name: 'Banco Original' },
  { code: '290', name: 'PagSeguro' },
  { code: '323', name: 'Mercado Pago' },
  { code: '380', name: 'PicPay' },
  { code: '637', name: 'Banco Sofisa Direto' },
  { code: '654', name: 'Banco Digimais' },

  // Cooperativas / regionais
  { code: '748', name: 'Sicredi' },
  { code: '756', name: 'Sicoob' },
  { code: '085', name: 'Cooperativa Central Ailos' },
  { code: '097', name: 'CrediSIS' },

  // Meios de pagamento / adquirentes (muito comuns em feiras)
  { code: '197', name: 'Stone Pagamentos' },
  { code: '352', name: 'PagBank (UOL)' },
  { code: '363', name: 'Cielo' },
  { code: '384', name: 'Neon Pagamentos' },
  { code: '461', name: 'Asaas' },
  { code: '082', name: 'Banco Topázio' },

  // Bancos de nicho / digitais menos comuns (mas reais)
  { code: '364', name: 'Gerencianet' },
  { code: '613', name: 'Banco Omni' },
  { code: '654', name: 'Banco Digio' },
  { code: '612', name: 'Banco Guanabara' },
  { code: '707', name: 'Banco Daycoval' },

  // Outros relevantes
  { code: '041', name: 'Banrisul' },
  { code: '070', name: 'Banco de Brasília (BRB)' },
  { code: '021', name: 'Banestes' },
  { code: '084', name: 'Uniprime' },
]

