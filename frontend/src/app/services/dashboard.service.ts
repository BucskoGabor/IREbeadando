import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalMembers: number;
  totalItemsAvailable: number;
  activeLoans: number;
  overdueLoans: number;
  recentActivity: {
    id: number;
    loanDate: string;
    memberName: string;
    itemTitle: string;
    returned: boolean;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
