import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

type LoginResponse = {
  token: string;
  expiresAt: string;
  fullName: string;
  username: string;
};

export type SessionData = LoginResponse & {
  userId: number | null;
};

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5045/api/auth';
  private readonly storageKey = 'sispark_session';
  private readonly sessionSignal = signal<SessionData | null>(this.readStoredSession());

  readonly session = computed(() => this.sessionSignal());
  readonly isAuthenticated = computed(() => !!this.sessionSignal()?.token);

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          const sessionData: SessionData = {
            ...response,
            userId: this.extractUserIdFromToken(response.token),
          };
          this.sessionSignal.set(sessionData);
          localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
        }),
      );
  }

  logout(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private readStoredSession(): SessionData | null {
    const rawSession = localStorage.getItem(this.storageKey);
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as SessionData;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
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
