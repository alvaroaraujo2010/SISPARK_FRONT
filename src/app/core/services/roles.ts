import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateRolePayload,
  Permission,
  RolePermission,
  UpdateRolePayload,
} from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/roles`;

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
  }

  getRoles(): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(this.apiUrl);
  }

  create(payload: CreateRolePayload): Observable<RolePermission> {
    return this.http.post<RolePermission>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateRolePayload): Observable<RolePermission> {
    return this.http.put<RolePermission>(`${this.apiUrl}/${id}`, payload);
  }

  updatePermissions(id: number, permissions: string[]): Observable<RolePermission> {
    return this.http.put<RolePermission>(`${this.apiUrl}/${id}/permissions`, { permissions });
  }
}
