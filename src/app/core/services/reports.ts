import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  DueSoonReport,
  IncomeReport,
  OccupancyReport,
  OperatorPerformanceReport,
} from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/reports`;

  income(from: string, to: string): Observable<IncomeReport> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<IncomeReport>(`${this.apiUrl}/income`, { params });
  }

  occupancy(from: string, to: string): Observable<OccupancyReport> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<OccupancyReport>(`${this.apiUrl}/occupancy`, { params });
  }

  operators(from: string, to: string): Observable<OperatorPerformanceReport> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<OperatorPerformanceReport>(`${this.apiUrl}/operators`, { params });
  }

  monthliesDue(daysAhead: number): Observable<DueSoonReport> {
    const params = new HttpParams().set('daysAhead', daysAhead.toString());
    return this.http.get<DueSoonReport>(`${this.apiUrl}/monthlies-due`, { params });
  }
}
