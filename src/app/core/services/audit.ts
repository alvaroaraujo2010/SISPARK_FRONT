import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuditEntry } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/audit`;

  search(
    from?: string,
    to?: string,
    userId?: number,
    modulo?: string,
    accion?: string,
    top = 200,
  ): Observable<AuditEntry[]> {
    let params = new HttpParams().set('top', top.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (userId) params = params.set('userId', userId.toString());
    if (modulo) params = params.set('modulo', modulo);
    if (accion) params = params.set('accion', accion);
    return this.http.get<AuditEntry[]>(this.apiUrl, { params });
  }
}
