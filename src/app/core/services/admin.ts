import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export type DashboardSummary = {
  activeVehicles: number;
  availableSpots: number;
  dailyRevenue: number;
  monthlyDueSoon: number;
};

export type VehicleType = {
  id: number;
  name: string;
};

export type VehicleRegistrationPayload = {
  identificationType: string;
  identificationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  plate: string;
  brand: string;
  vehicleModel: string;
  color: string;
  vehicleTypeId: number;
  paymentType: string;
  comments?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5045/api/admin';

  getDashboardSummary() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard-summary`);
  }

  getVehicleTypes() {
    return this.http.get<VehicleType[]>(`${this.apiUrl}/vehicle-types`);
  }

  registerVehicle(payload: VehicleRegistrationPayload) {
    return this.http.post(`${this.apiUrl}/vehicle-registrations`, payload);
  }
}
