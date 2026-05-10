import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  role: number;
  clubId: number | null;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiBaseUrl = `${environment.apiBaseUrl}/api`;
  private tokenKey = 'axis_token';
  private roleKey = 'axis_role';
  private clubKey = 'axis_club_id';
  private nameKey = 'axis_name';
  private userIdKey = 'axis_user_id';

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.clubKey);
    localStorage.removeItem(this.nameKey);
    localStorage.removeItem(this.userIdKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): number | null {
    const fromStorage = localStorage.getItem(this.roleKey);
    if (fromStorage !== null && fromStorage !== '') {
      return Number(fromStorage);
    }

    const payload = this.readTokenPayload();
    const roleValue =
      payload?.['role'] ??
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return roleValue !== undefined && roleValue !== null ? Number(roleValue) : null;
  }

  getClubId(): number | null {
    const fromStorage = localStorage.getItem(this.clubKey);
    if (fromStorage !== null && fromStorage !== '') {
      return Number(fromStorage);
    }

    const payload = this.readTokenPayload();
    const clubValue = payload?.['ClubId'];
    return clubValue !== undefined && clubValue !== null ? Number(clubValue) : null;
  }

  getUserId(): number | null {
    const fromStorage = localStorage.getItem(this.userIdKey);
    if (fromStorage !== null && fromStorage !== '') {
      return Number(fromStorage);
    }

    const payload = this.readTokenPayload();
    const userValue =
      payload?.['nameid'] ??
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    return userValue !== undefined && userValue !== null ? Number(userValue) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isIt(): boolean {
    return this.getRole() === 0;
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);

    if (res.role !== undefined && res.role !== null) {
      localStorage.setItem(this.roleKey, String(res.role));
    }

    if (res.clubId !== undefined && res.clubId !== null) {
      localStorage.setItem(this.clubKey, String(res.clubId));
    }

    if (res.name) {
      localStorage.setItem(this.nameKey, res.name);
    }

    const payload = this.readTokenPayload();
    const userValue =
      payload?.['nameid'] ??
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (userValue !== undefined && userValue !== null) {
      localStorage.setItem(this.userIdKey, String(userValue));
    }
  }

  private readTokenPayload(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      // JWT uses base64url encoding.
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = payload.length % 4;
      if (padding) {
        payload += '='.repeat(4 - padding);
      }

      return JSON.parse(atob(payload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
