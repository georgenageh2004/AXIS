import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ClubUser {
  userId: number;
  name: string;
  email: string;
  role: number;
  clubId: number | null;
}

export interface UserUpdatePayload {
  email: string;
  password?: string;
  role: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private http = inject(HttpClient);
  private apiBaseUrl = `${environment.apiBaseUrl}/api`;

  getClubUsers() {
    return this.http.get<ClubUser[]>(`${this.apiBaseUrl}/admin/users`);
  }

  updateUser(id: number, payload: UserUpdatePayload) {
    return this.http.put<{ message: string }>(`${this.apiBaseUrl}/admin/user/${id}`,
      payload
    );
  }
}
