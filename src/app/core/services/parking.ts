import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ActiveVehicle,
  ElectronicInvoiceRequest,
  ParkingBoardVehicle,
  ParkingMovementPreview,
  ParkingMovementResult,
  ReprintTicketResult,
  ParkingRegistrationPreviewPayload,
  ParkingRegistrationPreviewResult,
} from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class Parking {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/parking`;

  previewRegistration(payload: ParkingRegistrationPreviewPayload): Observable<ParkingRegistrationPreviewResult> {
    return this.http.post<ParkingRegistrationPreviewResult>(`${this.apiUrl}/registrations/preview`, payload);
  }

  getActiveVehicles(): Observable<ActiveVehicle[]> {
    return this.http.get<ActiveVehicle[]>(`${this.apiUrl}/active`);
  }

  getParkingBoard(): Observable<ParkingBoardVehicle[]> {
    return this.http.get<ParkingBoardVehicle[]>(`${this.apiUrl}/board`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 404) {
          return throwError(() => error);
        }

        return this.getActiveVehicles().pipe(
          map((vehicles) =>
            vehicles.map((vehicle) => this.mapActiveToBoardRow(vehicle)),
          ),
        );
      }),
    );
  }

  private mapActiveToBoardRow(vehicle: ActiveVehicle): ParkingBoardVehicle {
    return {
      idRegistro: vehicle.idRegistro,
      placa: vehicle.placa,
      tipoVehiculo: '—',
      tipoServicio: vehicle.tipoServicio,
      fechaIngreso: vehicle.fechaIngreso ?? null,
      fechaSalida: vehicle.fechaSalida,
      valorPagar: vehicle.valorPagar,
      estado: vehicle.fechaSalida ? 'Salió' : 'Activo',
    };
  }

  getMovementPreview(plate: string): Observable<ParkingMovementPreview> {
    const encoded = encodeURIComponent(plate.trim().toUpperCase());
    return this.http.get<ParkingMovementPreview>(`${this.apiUrl}/plates/${encoded}/movement-preview`);
  }

  registerEntryExit(
    plate: string,
    vehicleTypeId?: number,
    wantsElectronicInvoice = false,
    electronicInvoice?: ElectronicInvoiceRequest,
    lostTicket = false,
  ): Observable<ParkingMovementResult> {
    return this.http.post<ParkingMovementResult>(`${this.apiUrl}/entry-exit`, {
      plate,
      vehicleTypeId: vehicleTypeId ?? null,
      wantsElectronicInvoice,
      electronicInvoice: wantsElectronicInvoice ? electronicInvoice : null,
      lostTicket,
    });
  }

  reprintTicket(registrationId: number): Observable<ReprintTicketResult> {
    return this.http.get<ReprintTicketResult>(`${this.apiUrl}/registrations/${registrationId}/ticket`);
  }
}
