import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ClientSummary, UpdateClientPayload } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/clients`;

  search(search: string | null, includeInactive: boolean): Observable<ClientSummary[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (includeInactive) params['includeInactive'] = 'true';
    return this.http.get<ClientSummary[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ClientSummary> {
    return this.http.get<ClientSummary>(`${this.apiUrl}/${id}`);
  }

  update(id: number, payload: UpdateClientPayload): Observable<ClientSummary> {
    return this.http.put<ClientSummary>(`${this.apiUrl}/${id}`, payload);
  }
}
