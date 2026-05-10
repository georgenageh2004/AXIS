import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardResponse } from '../Models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
	private readonly baseUrl = `${environment.apiBaseUrl}/api/Dashboard`;

	constructor(private http: HttpClient) {}

	fetchDashboard(teamId: string | number): Observable<DashboardResponse> {
		const id = encodeURIComponent(String(teamId));
		return this.http.get<DashboardResponse>(`${this.baseUrl}/${id}`);
	}
}

