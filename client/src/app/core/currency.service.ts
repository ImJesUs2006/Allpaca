import { Injectable, computed, effect, signal } from '@angular/core';

const CURRENCY_KEY = 'allpaca.currency';

/** DESIGN.md §8 — lista completa, en el mismo orden que el prototipo. */
export const CURRENCIES = [
  'USD', 'ARS', 'MXN', 'COP', 'CLP', 'PEN', 'GTQ', 'SVC', 'PYG',
  'UYU', 'BOB', 'VES', 'DOP', 'BZD', 'HNL', 'NIO', 'PAB', 'CRC',
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

/**
 * Tipos de cambio referenciales respecto a USD (1 USD = X).
 *
 * NOTA IMPORTANTE: son valores fijos embebidos, NO una fuente de verdad. Sirven
 * para que el selector de moneda funcione y para demostrar la conversion, pero
 * un marketplace real debe consultar una API de tipo de cambio. Ver README.
 */
export const RATES_PER_USD: Record<CurrencyCode, number> = {
  USD: 1,
  ARS: 1000,
  MXN: 17.5,
  COP: 3900,
  CLP: 950,
  PEN: 3.75,
  GTQ: 7.7,
  SVC: 8.75,
  PYG: 7300,
  UYU: 38,
  BOB: 6.9,
  VES: 36,
  DOP: 59,
  BZD: 2.01,
  HNL: 24.7,
  NIO: 36.8,
  PAB: 1,
  CRC: 510,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$', ARS: '$', MXN: '$', COP: '$', CLP: '$', PEN: 'S/', GTQ: 'Q',
  SVC: 'C$', PYG: '₲', UYU: '$U', BOB: 'Bs', VES: 'Bs', DOP: 'RD$',
  BZD: 'BZ$', HNL: 'L', NIO: 'C$', PAB: 'B/.', CRC: '₡',
};

const DECIMALS: Record<CurrencyCode, number> = {
  USD: 2, ARS: 0, MXN: 2, COP: 0, CLP: 0, PEN: 2, GTQ: 2, SVC: 2,
  PYG: 0, UYU: 0, BOB: 2, VES: 2, DOP: 2, BZD: 2, HNL: 2, NIO: 2,
  PAB: 2, CRC: 0,
};

/**
 * DESIGN.md §8 marcaba el selector de divisa como pendiente: la constante
 * existia pero no habia selector ni conversion. Esto lo implementa.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly _code = signal<CurrencyCode>(readStored());

  readonly code = this._code.asReadonly();
  readonly symbol = computed(() => SYMBOLS[this._code()]);

  constructor() {
    effect(() => localStorage.setItem(CURRENCY_KEY, this._code()));
  }

  set(code: CurrencyCode): void {
    this._code.set(code);
  }

  /** Convierte centavos USD a centavos de la divisa activa. */
  convertFromUsdCents(usdCents: number): number {
    return Math.round(usdCents * RATES_PER_USD[this._code()]);
  }

  /** Formatea centavos de la divisa activa. Ej: format(4500) -> "$45.00" */
  format(cents: number): string {
    const amount = (cents / 100).toLocaleString("es-MX", {
      minimumFractionDigits: DECIMALS[this._code()],
      maximumFractionDigits: DECIMALS[this._code()],
    });
    return `${SYMBOLS[this._code()]}${amount}`;
  }

  /** Formatea un precio que ya viene en centavos de otra moneda (p. ej. USD). */
  formatConverted(usdCents: number): string {
    return this.format(this.convertFromUsdCents(usdCents));
  }

  cycle(): void {
    const i = CURRENCIES.indexOf(this._code());
    this._code.set(CURRENCIES[(i + 1) % CURRENCIES.length]!);
  }
}

function readStored(): CurrencyCode {
  const raw = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
  return raw && CURRENCIES.includes(raw) ? raw : 'USD';
}
