import { Injectable, signal } from '@angular/core';

/** Pulso reactivo para recargar tablero, resumen y vehiculos activos en la UI. */
@Injectable({ providedIn: 'root' })
export class BoardRefresh {
  readonly tick = signal(0);

  bump(): void {
    this.tick.update((value) => value + 1);
  }
}
