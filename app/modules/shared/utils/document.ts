/**
 * Utilitários para CPF/CNPJ.
 * Responsabilidade:
 * - Normalizar entrada (remover pontuação)
 * - Mascarar para exibição
 */

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function maskCpfCnpj(value: string) {
  const digits = onlyDigits(value)

  // CPF: 11 dígitos
  if (digits.length <= 11) {
    const v = digits.padEnd(11, '')
    return v
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})\.(\d{3})(\d{1,2}).*/, '.$1.$2-$3')
      .trim()
  }

  // CNPJ: 14 dígitos
  const v = digits.padEnd(14, '')
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2}).*/, '$1-$2')
    .trim()
}
