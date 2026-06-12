import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ChangePasswordPayload, LoginResponse } from '../models/api.types';

export type SessionData = LoginResponse & {
  userId: number | null;
};

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  private readonly storageKey = 'sispark_session';
  private readonly sessionSignal = signal<SessionData | null>(null);
  private sessionTimeoutId: number | null = null;

  readonly session = computed(() => this.sessionSignal());
  readonly isAuthenticated = computed(() => !!this.sessionSignal()?.token);

  constructor() {
    const storedSession = this.readStoredSession();
    this.sessionSignal.set(storedSession);

    if (storedSession) {
      this.scheduleSessionExpiration(storedSession);
    }
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response) => {
        const sessionData: SessionData = {
          ...response,
          permissions: response.permissions ?? [],
          userId: this.extractUserIdFromToken(response.token),
        };

        this.persistSession(sessionData);
      }),
    );
  }

  changePassword(payload: ChangePasswordPayload) {
    return this.http.post<void>(`${this.apiUrl}/change-password`, payload);
  }

  logout(): void {
    this.clearSessionTimer();
    this.sessionSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  getAccessToken(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  private persistSession(sessionData: SessionData): void {
    this.clearSessionTimer();
    this.sessionSignal.set(sessionData);
    localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    this.scheduleSessionExpiration(sessionData);
  }

  private readStoredSession(): SessionData | null {
    const rawSession = localStorage.getItem(this.storageKey);
    if (!rawSession) {
      return null;
    }

    try {
      const session = JSON.parse(rawSession) as SessionData;
      session.permissions = session.permissions ?? [];

      if (this.isSessionExpired(session)) {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private scheduleSessionExpiration(sessionData: SessionData): void {
    const remainingMs = new Date(sessionData.expiresAt).getTime() - Date.now();

    if (remainingMs <= 0) {
      this.logout();
      return;
    }

    this.sessionTimeoutId = window.setTimeout(() => {
      this.logout();
    }, remainingMs);
  }

  private clearSessionTimer(): void {
    if (this.sessionTimeoutId !== null) {
      window.clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
  }

  private isSessionExpired(session: SessionData): boolean {
    return new Date(session.expiresAt).getTime() <= Date.now();
  }

  private extractUserIdFromToken(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      const candidate =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        payload.sub;
      const userId = Number(candidate);
      return Number.isFinite(userId) ? userId : null;
    } catch {
      return null;
    }
  }
}
