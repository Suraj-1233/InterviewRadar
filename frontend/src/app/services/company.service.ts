import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Company } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private apiUrl = 'http://localhost:8080/api/companies';

  private _companies = signal<Company[]>([]);
  private _loading   = signal(false);

  companies = this._companies.asReadonly();
  loading   = this._loading.asReadonly();

  constructor(private http: HttpClient) {}

  fetchCompanies(): void {
    this._loading.set(true);
    this.http.get<Company[]>(this.apiUrl).subscribe({
      next: (data) => {
        this._companies.set(data);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  getBySlug(slug: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/slug/${slug}`);
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  createCompany(name: string): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, { name });
  }

  // Helper: get a display icon for a company by name
  getIcon(name: string): string {
    return '';
  }
}
