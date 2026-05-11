import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private apiUrl = 'http://localhost:3000/api/loans';

  constructor(private http: HttpClient) {}

  createLoan(memberId: number, itemId: number): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, { memberId, itemId });
  }

  returnLoan(loanId: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/${loanId}/return`, {});
  }

  getOverdueLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/overdue`);
  }

  getMemberLoans(memberId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/member/${memberId}`);
  }

  getLoanByItem(itemId: number): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/item/${itemId}`);
  }
}
