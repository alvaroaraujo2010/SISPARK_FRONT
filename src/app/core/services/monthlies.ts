import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateMonthlyPayload,
  Monthly,
  MonthlyHistoryEntry,
  RenewMonthlyPayload,
} from '../models/api.types';

export type MonthlyStatusFilter = 'Vigentes' | 'Vencidas' | 'Todas';

@Injectable({
  providedIn: 'root',
})
export class MonthliesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/monthlies`;

  search(
    search: string | null,
    status: MonthlyStatusFilter,
    onlyDueSoon: boolean,
    daysAhead: number,
  ): Observable<Monthly[]> {
    let params = new HttpParams().set('status', status).set('daysAhead', daysAhead.toString());
    if (search) params = params.set('search', search);
    if (onlyDueSoon) params = params.set('onlyDueSoon', 'true');
    return this.http.get<Monthly[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Monthly> {
    return this.http.get<Monthly>(`${this.apiUrl}/${id}`);
  }

  history(id: number): Observable<MonthlyHistoryEntry[]> {
    return this.http.get<MonthlyHistoryEntry[]>(`${this.apiUrl}/${id}/history`);
  }

  create(payload: CreateMonthlyPayload): Observable<Monthly> {
    return this.http.post<Monthly>(this.apiUrl, payload);
  }

  renew(id: number, payload: RenewMonthlyPayload): Observable<Monthly> {
    return this.http.post<Monthly>(`${this.apiUrl}/${id}/renew`, payload);
  }

  cancel(id: number): Observable<Monthly> {
    return this.http.post<Monthly>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
