import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateRatePayload, Rate, UpdateRatePayload } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class RatesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/rates`;

  list(includeInactive: boolean): Observable<Rate[]> {
    const params: Record<string, string> = {};
    if (includeInactive) params['includeInactive'] = 'true';
    return this.http.get<Rate[]>(this.apiUrl, { params });
  }

  create(payload: CreateRatePayload): Observable<Rate> {
    return this.http.post<Rate>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateRatePayload): Observable<Rate> {
    return this.http.put<Rate>(`${this.apiUrl}/${id}`, payload);
  }
}
