import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public routes ────────────────────────────────────────────────────────
  { path: '', loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent) },
  { path: 'feed', redirectTo: '', pathMatch: 'full' },
  { path: 'explore', loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent) },
  { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'company/:slug', loadComponent: () => import('./features/company/company-page/company-page.component').then(m => m.CompanyPageComponent) },
  { path: 'search',  loadComponent: () => import('./features/search/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'u/:username', loadComponent: () => import('./features/profile/user-profile/user-profile.component').then(m => m.UserProfileComponent) },

  // ── Protected routes (require login) ─────────────────────────────────────
  {
    path: 'post/create',
    canActivate: [authGuard],
    loadComponent: () => import('./features/post/post-create/post-create.component').then(m => m.PostCreateComponent)
  },
  {
    path: 'post/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/post/post-create/post-create.component').then(m => m.PostCreateComponent)
  },
  {
    path: 'post/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/post/post-edit/post-edit.component').then(m => m.PostEditComponent)
  },
  
  // ── Detail route (must be AFTER specific post routes) ────────────────────
  { path: 'post/:id', loadComponent: () => import('./features/post/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },

  // ── Admin routes ──────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];
