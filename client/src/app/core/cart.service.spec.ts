import { TestBed } from '@angular/core/testing';
import type { Product } from './api.models';
import { CartService } from './cart.service';

function product(id: number, name = `Prenda ${id}`): Product {
  return {
    id,
    name,
    price_cents: 4500,
    currency: 'USD',
    image_url: 'https://example.com/x.jpg',
    category: 'Tops',
    size: 'M',
    condition: 'Usado',
    location: 'CDMX',
    seller: 'vendedor',
    rating: 4.5,
    verified: false,
    styles: ['Streetwear'],
  };
}

describe('CartService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  /** Los `effect` de Angular corren de forma asincrona; hay que drenarlos. */
  async function settle(): Promise<void> {
    await new Promise((r) => setTimeout(r, 0));
  }

  function make(): CartService {
    TestBed.configureTestingModule({});
    return TestBed.inject(CartService);
  }

  it('empieza vacio', () => {
    const cart = make();
    expect(cart.items()).toEqual([]);
    expect(cart.count()).toBe(0);
  });

  it('recupera el carrito de localStorage', () => {
    localStorage.setItem('allpaca.cart', JSON.stringify([product(1)]));
    expect(make().items()).toHaveLength(1);
  });

  it('ignora localStorage corrupto en vez de romper', async () => {
    localStorage.setItem('allpaca.cart', '{esto no es json');
    const cart = make();
    expect(cart.items()).toEqual([]);
    await settle();
    // El servicio limpia la clave corrupta y la reescribe como array vacio.
    expect(localStorage.getItem('allpaca.cart')).toBe('[]');
  });

  it('ignora un localStorage que no es un array', () => {
    localStorage.setItem('allpaca.cart', JSON.stringify({ no: 'es array' }));
    expect(make().items()).toEqual([]);
  });

  it('agrega un producto y abre el carrito', () => {
    const cart = make();
    cart.add(product(1));
    expect(cart.items()).toHaveLength(1);
    expect(cart.isOpen()).toBe(true);
  });

  it('no agrega dos veces el mismo producto', () => {
    const cart = make();
    cart.add(product(1));
    cart.add(product(1));
    expect(cart.count()).toBe(1);
  });

  it('quita un producto por id', () => {
    const cart = make();
    cart.add(product(1));
    cart.add(product(2));
    cart.remove(1);
    expect(cart.items().map((p) => p.id)).toEqual([2]);
    expect(cart.has(1)).toBe(false);
  });

  it('has() responde si un producto esta en el carrito', () => {
    const cart = make();
    cart.add(product(7));
    expect(cart.has(7)).toBe(true);
    expect(cart.has(8)).toBe(false);
  });

  it('toggle alterna la visibilidad', () => {
    const cart = make();
    expect(cart.isOpen()).toBe(false);
    cart.toggle();
    expect(cart.isOpen()).toBe(true);
    cart.toggle();
    expect(cart.isOpen()).toBe(false);
  });

  it('clear vacia el carrito', () => {
    const cart = make();
    cart.add(product(1));
    cart.clear();
    expect(cart.items()).toEqual([]);
  });

  it('persiste el carrito en localStorage', async () => {
    const cart = make();
    cart.add(product(3));
    await settle();
    expect(JSON.parse(localStorage.getItem('allpaca.cart') ?? '[]')).toHaveLength(1);
  });
});
