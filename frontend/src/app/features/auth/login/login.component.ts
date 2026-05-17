import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card animate-fade-up">

        <!-- Logo -->
        <a routerLink="/" class="auth-logo">
          <div class="auth-logo-icon">📡</div>
          <span class="auth-logo-text">InterviewRadar</span>
        </a>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your account to continue</p>

        <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)" novalidate style="display:flex;flex-direction:column;gap:1.125rem;">

          <div class="input-group">
            <label class="input-label">Email address</label>
            <input type="email" name="email" ngModel required email
                   class="input-field"
                   placeholder="you@example.com">
            <p *ngIf="loginForm.submitted && loginForm.controls['email']?.invalid"
               style="color:var(--red);font-size:0.8125rem;margin-top:4px;">Please enter a valid email</p>
          </div>

          <div class="input-group">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label class="input-label" style="margin-bottom:0;">Password</label>
              <a href="#" style="font-size:0.8125rem;color:#a78bfa;font-weight:600;">Forgot password?</a>
            </div>
            <input type="password" name="password" ngModel required minlength="6"
                   class="input-field"
                   placeholder="••••••••">
            <p *ngIf="loginForm.submitted && loginForm.controls['password']?.invalid"
               style="color:var(--red);font-size:0.8125rem;margin-top:4px;">Password must be at least 6 characters</p>
          </div>

          <div *ngIf="errorMsg" class="auth-error">{{errorMsg}}</div>

          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading"
                  style="width:100%;margin-top:0.5rem;">
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>

        </form>

        <hr class="auth-divider">
        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/register" style="margin-left:4px;">Create one free</a>
        </p>

      </div>
    </div>
  `
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading  = false;
  errorMsg = '';

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.loading  = true;
    this.errorMsg = '';
    this.auth.login(form.value).subscribe({
      next: ()    => this.router.navigate(['/']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Invalid email or password';
        this.loading  = false;
      }
    });
  }
}
