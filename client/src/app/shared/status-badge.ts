import { Component, input } from '@angular/core';

/**
 * Badge de estado de pedido. Portado de App.tsx:1005-1020 (StatusBadge).
 * DESIGN.md §5 — `border-2`; ENTREGADO invertido, PENDIENTE en amarillo
 * (el unico color de la app), el resto en blanco.
 */
@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="border-2 border-black px-3 py-1 text-xs font-bold uppercase font-body inline-block"
      [class.bg-black]="status() === 'ENTREGADO'"
      [class.text-white]="status() === 'ENTREGADO'"
      [class.bg-accent]="status() === 'PENDIENTE'"
      [class.text-black]="status() === 'PENDIENTE'"
      [class.bg-white]="status() !== 'ENTREGADO' && status() !== 'PENDIENTE'"
      [class.text-black]="status() !== 'ENTREGADO' && status() !== 'PENDIENTE'"
    >
      {{ status() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
}
