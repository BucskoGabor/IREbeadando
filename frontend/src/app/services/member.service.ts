import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private apiUrl = 'http://localhost:3000/api/members';

  constructor(private http: HttpClient) {}

  getMembers(search?: string, showInactive?: boolean): Observable<Member[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (showInactive) params = params.set('showInactive', 'true');
    return this.http.get<Member[]>(this.apiUrl, { params });
  }

  getMember(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  createMember(member: Partial<Member>): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }

  updateMember(id: number, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member);
  }

  deleteMember(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
