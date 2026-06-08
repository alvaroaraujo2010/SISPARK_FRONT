import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  RoleOption,
  UpdateUserPayload,
  UserAccount,
} from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/users`;

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<RoleOption[]>(`${this.apiUrl}/roles`);
  }

  getUsers(): Observable<UserAccount[]> {
    return this.http.get<UserAccount[]>(this.apiUrl);
  }

  getById(id: number): Observable<UserAccount> {
    return this.http.get<UserAccount>(`${this.apiUrl}/${id}`);
  }

  createUser(payload: CreateUserPayload): Observable<UserAccount> {
    return this.http.post<UserAccount>(this.apiUrl, payload);
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<UserAccount> {
    return this.http.put<UserAccount>(`${this.apiUrl}/${id}`, payload);
  }

  setActive(id: number, isActive: boolean): Observable<UserAccount> {
    return this.http.patch<UserAccount>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  resetPassword(id: number, payload: ResetPasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reset-password`, payload);
  }
}
