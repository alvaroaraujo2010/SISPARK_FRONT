import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateTenantRequest, TenantResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/tenants`;

  getTenants(): Observable<TenantResponse[]> {
    return this.http.get<TenantResponse[]>(this.apiUrl);
  }

  create(payload: CreateTenantRequest): Observable<TenantResponse> {
    return this.http.post<TenantResponse>(this.apiUrl, payload);
  }
}
