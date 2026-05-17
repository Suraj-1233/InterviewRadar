import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../models/user.model';

const TOKEN_KEY = 'ir_token';
const USER_KEY  = 'ir_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // ── State ──────────────────────────────────────────────────────────────────
  private _currentUser = signal<User | null>(this.loadUser());

  // ── Public read-only signals ───────────────────────────────────────────────
  currentUser = this._currentUser.asReadonly();
  isLoggedIn  = computed(() => this._currentUser() !== null);
  isAdmin     = computed(() => this._currentUser()?.isAdmin === true);

  constructor(private http: HttpClient, private router: Router) {}

  register(req: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(req: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  updateProfile(data: Partial<User>) {
    return this.http.put<User>('http://localhost:8080/api/users/me', data).pipe(
      tap(updatedUser => {
        const user: User = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          profilePicUrl: updatedUser.profilePicUrl,
          isAdmin: updatedUser.isAdmin,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private saveSession(res: AuthResponse) {
    const user: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      profilePicUrl: res.profilePicUrl,
      isAdmin: res.isAdmin,
    };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
