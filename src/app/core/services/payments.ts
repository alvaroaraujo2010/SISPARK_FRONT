import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CashCloseout,
  CashShift,
  CloseCashShiftPayload,
  CreatePaymentPayload,
  OpenCashShiftPayload,
  Payment,
  PaymentMethod,
} from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/payments`;

  search(from?: string, to?: string, userId?: number, methodId?: number): Observable<Payment[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (userId) params = params.set('userId', userId.toString());
    if (methodId) params = params.set('methodId', methodId.toString());
    return this.http.get<Payment[]>(this.apiUrl, { params });
  }

  methods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/methods`);
  }

  cashCloseout(date: string): Observable<CashCloseout> {
    return this.http.get<CashCloseout>(`${this.apiUrl}/cash-closeout`, { params: { date } });
  }

  openShift(): Observable<CashShift | null> {
    return this.http.get<CashShift | null>(`${this.apiUrl}/shift/open`);
  }

  startShift(payload: OpenCashShiftPayload): Observable<CashShift> {
    return this.http.post<CashShift>(`${this.apiUrl}/shift/open`, payload);
  }

  closeShift(payload: CloseCashShiftPayload): Observable<CashShift> {
    return this.http.post<CashShift>(`${this.apiUrl}/shift/close`, payload);
  }

  create(payload: CreatePaymentPayload): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payload);
  }
}
