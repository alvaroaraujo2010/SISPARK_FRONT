import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ActiveVehicle,
  ParkingMovementResult,
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

  registerEntryExit(plate: string): Observable<ParkingMovementResult> {
    return this.http.post<ParkingMovementResult>(`${this.apiUrl}/entry-exit`, { plate });
  }
}
