import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../Models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
	private readonly baseUrl = 'http://localhost:5262/api/Dashboard';

	constructor(private http: HttpClient) {}

	fetchDashboard(teamId: string | number): Observable<DashboardResponse> {
		const id = encodeURIComponent(String(teamId));
		return this.http.get<DashboardResponse>(`${this.baseUrl}/${id}`);
	}
}

