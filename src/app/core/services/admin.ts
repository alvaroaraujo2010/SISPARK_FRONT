import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  DashboardSummary,
  VehicleRegistrationPayload,
  VehicleRegistrationResult,
  VehicleType,
} from '../models/api.types';

export type { VehicleType, VehicleRegistrationPayload, DashboardSummary } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin`;

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard-summary`);
  }

  getVehicleTypes(): Observable<VehicleType[]> {
    return this.http.get<VehicleType[]>(`${this.apiUrl}/vehicle-types`);
  }

  registerVehicle(payload: VehicleRegistrationPayload): Observable<VehicleRegistrationResult> {
    return this.http.post<VehicleRegistrationResult>(`${this.apiUrl}/vehicle-registrations`, payload);
  }
}
