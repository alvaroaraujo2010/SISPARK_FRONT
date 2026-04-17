import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';

export type ActiveVehicle = {
  idRegistro: number;
  placa: string;
  fechaIngreso: string;
  fechaSalida: string | null;
  valorPagar: number;
  tipoServicio: string;
};

type ParkingMovementResponse = {
  success: boolean;
  action: 'entry' | 'exit';
  message: string;
  totalToPay?: number;
};

@Injectable({
  providedIn: 'root',
})
export class Parking {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5045/api/parking';

  previewRegistration(payload: unknown) {
    return this.http
      .post(`${this.apiUrl}/registrations/preview`, payload)
      .pipe(tap((response) => console.log('Vehicle registration preview response', response)));
  }

  getActiveVehicles() {
    return this.http.get<ActiveVehicle[]>(`${this.apiUrl}/active`);
  }

  registerEntryExit(plate: string) {
    return this.http
      .post<ParkingMovementResponse>(`${this.apiUrl}/entry-exit`, { plate })
      .pipe(tap((response) => console.log('Parking movement response', response)));
  }
}
