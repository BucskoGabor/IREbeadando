import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Setting } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SettingService {
  private apiUrl = 'http://localhost:3000/api/settings';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.apiUrl);
  }

  updateSetting(key: string, value: string): Observable<Setting> {
    return this.http.put<Setting>(`${this.apiUrl}/${key}`, { value });
  }
}
