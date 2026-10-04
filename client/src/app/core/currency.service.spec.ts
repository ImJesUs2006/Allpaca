import { TestBed } from '@angular/core/testing';
import { CurrencyService, CURRENCIES, RATES_PER_USD } from './currency.service';

const KEY = 'allpaca.currency';

describe('CurrencyService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  /** Los `effect` de Angular corren de forma asincrona; hay que drenarlos. */
  async function settle(): Promise<void> {
    await new Promise((r) => setTimeout(r, 0));
  }

  function make(): CurrencyService {
    TestBed.configureTestingModule({});
    return TestBed.inject(CurrencyService);
  }

  it('arranca en USD si no hay nada guardado', () => {
    expect(make().code()).toBe('USD');
  });

  it('recupera la divisa guardada', () => {
    localStorage.setItem(KEY, 'MXN');
    expect(make().code()).toBe('MXN');
  });

  it('ignora un valor guardado que no es una divisa valida', () => {
    localStorage.setItem(KEY, 'XXX');
    expect(make().code()).toBe('USD');
  });

  it('convierte centavos USD a la divisa activa', () => {
    const s = make();
    s.set('MXN');
    // 45.00 USD * 17.5 = 787.50 MXN -> 78750 centavos
    expect(s.convertFromUsdCents(4500)).toBe(78750);
  });

  it('no convierte si la divisa es USD', () => {
    const s = make();
    s.set('USD');
    expect(s.convertFromUsdCents(4500)).toBe(4500);
  });

  it('formatea USD con dos decimales', () => {
    const s = make();
    s.set('USD');
    expect(s.format(4500)).toBe('$45.00');
  });

  it('formatea COP sin decimales', () => {
    const s = make();
    s.set('COP');
    // 4500 centavos USD * 3900 = 17,550,000 centavos = $175,500 COP.
    // es-MX separa los miles con coma, no con punto.
    expect(s.format(4500 * RATES_PER_USD.COP)).toBe('$175,500');
  });

  it('usa el simbolo propio de cada divisa', () => {
    const s = make();
    s.set('PEN');
    expect(s.format(4500)).toMatch(/^S\//);
    s.set('GTQ');
    expect(s.format(4500)).toMatch(/^Q/);
  });

  it('formatConverted convierte y formatea en un paso', () => {
    const s = make();
    s.set('ARS');
    // ARS a 1000 por USD: 4500 centavos -> 4.500.000 centavos -> $45,000
    expect(s.formatConverted(4500)).toBe('$45,000');
  });

  it('formatConverted es coherente con convert + format', () => {
    const s = make();
    for (const code of ['USD', 'MXN', 'ARS', 'COP', 'PEN'] as const) {
      s.set(code);
      expect(s.formatConverted(4500)).toBe(s.format(s.convertFromUsdCents(4500)));
    }
  });

  it('cambia la divisa y la persiste', async () => {
    const s = make();
    s.set('PEN');
    expect(s.code()).toBe('PEN');
    await settle();
    expect(localStorage.getItem(KEY)).toBe('PEN');
  });

  it('cycle recorre todas las divisas y vuelve al inicio', () => {
    const s = make();
    s.set('USD');
    for (let i = 1; i < CURRENCIES.length; i++) {
      s.cycle();
      expect(CURRENCIES).toContain(s.code());
    }
    s.cycle();
    expect(s.code()).toBe('USD');
  });
});
