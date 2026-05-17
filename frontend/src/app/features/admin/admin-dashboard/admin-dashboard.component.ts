import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../../../components/nav/nav.component';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../services/post.service';
import { CompanyService } from '../../../services/company.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page-wrapper">
      <div class="container" style="padding-top:2.5rem;padding-bottom:4rem;">

        <div *ngIf="!auth.isAdmin()">
          <div class="card animate-fade-up" style="padding:4rem;text-align:center;max-width:480px;margin:0 auto;">
            <div style="font-size:3rem;margin-bottom:1rem;">🚫</div>
            <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--text);margin-bottom:0.5rem;">Access Denied</h2>
            <p style="color:var(--text-3);margin-bottom:1.5rem;">You need admin privileges to view this page.</p>
            <a routerLink="/" class="btn btn-ghost">← Back to Feed</a>
          </div>
        </div>

        <div *ngIf="auth.isAdmin()">
          <div class="animate-fade-up">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;">
              <div>
                <h1 style="font-family:var(--font-display);font-size:1.875rem;font-weight:800;color:var(--text);letter-spacing:-0.04em;margin-bottom:4px;">Admin Dashboard</h1>
                <p style="color:var(--text-3);font-size:0.9375rem;">Platform management &amp; moderation</p>
              </div>
              <span class="badge badge-purple" style="font-size:0.875rem;padding:6px 14px;">Admin Panel</span>
            </div>

            <!-- Stats Grid -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem;">
              <div *ngFor="let stat of adminStats" class="card" style="padding:1.5rem;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                  <span style="font-size:1.25rem;">{{stat.icon}}</span>
                  <span class="badge"
                        [class.badge-green]="stat.trend > 0"
                        [class.badge-red]="stat.trend < 0"
                        [class.badge-indigo]="stat.trend === 0">
                    {{stat.trend > 0 ? '+' : ''}}{{stat.trend}}%
                  </span>
                </div>
                <div style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;color:var(--text);letter-spacing:-0.03em;">{{stat.value}}</div>
                <div style="font-size:0.8125rem;color:var(--text-3);margin-top:4px;">{{stat.label}}</div>
              </div>
            </div>

            <!-- Main Content Grid -->
            <div style="display:grid;grid-template-columns:1fr 320px;gap:1.5rem;">

              <!-- Posts Table -->
              <div>
                <!-- Tab Bar -->
                <div style="display:flex;gap:4px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--r-md);padding:4px;width:fit-content;margin-bottom:1.25rem;">
                  <button *ngFor="let tab of tabs" (click)="activeTab = tab.value" class="btn btn-sm"
                          [style.background]="activeTab === tab.value ? 'var(--accent)' : 'transparent'"
                          [style.color]="activeTab === tab.value ? '#fff' : 'var(--text-3)'"
                          style="border:none;">{{tab.label}}</button>
                </div>

                <!-- Posts Tab -->
                <div *ngIf="activeTab === 'posts'">
                  <div class="card" style="overflow:hidden;">
                    <div style="padding:1.25rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
                      <p style="font-size:0.875rem;font-weight:600;color:var(--text);">All Posts</p>
                      <span style="font-size:0.8125rem;color:var(--text-3);">{{postService.posts().length}} total</span>
                    </div>
                    <div *ngIf="postService.loading()">
                      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:12px;">
                        <div *ngFor="let i of [1,2,3,4]" class="skeleton" style="height:52px;border-radius:var(--r-md);"></div>
                      </div>
                    </div>
                    <div *ngIf="!postService.loading()">
                      <div>
                        <div *ngFor="let post of postService.posts().slice(0, 10)"
                             style="display:flex;align-items:center;gap:12px;padding:14px 1.25rem;border-bottom:1px solid var(--border);transition:background var(--dur);"
                             onmouseenter="this.style.background='rgba(255,255,255,0.03)'"
                             onmouseleave="this.style.background='transparent'">
                          <div style="flex:1;min-width:0;">
                            <div style="font-size:0.9rem;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{post.title}}</div>
                            <div style="font-size:0.75rem;color:var(--text-3);margin-top:2px;">by {{post.authorName}} · {{post.createdAt | date:'MMM d'}}</div>
                          </div>
                          <span *ngIf="post.result" class="badge"
                                [class.badge-green]="post.result === 'Selected'"
                                [class.badge-red]="post.result === 'Rejected'"
                                [class.badge-amber]="post.result !== 'Selected' && post.result !== 'Rejected'">
                            {{post.result}}
                          </span>
                          <div style="display:flex;gap:6px;flex-shrink:0;">
                            <a [routerLink]="['/post', post.id]" class="btn btn-ghost btn-sm">View</a>
                            <button (click)="deletePost(post)" class="btn btn-sm"
                                    style="background:var(--red-soft);color:var(--red);border:1px solid rgba(248,113,113,0.2);">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Companies Tab -->
                <div *ngIf="activeTab === 'companies'">
                  <div class="card" style="overflow:hidden;">
                    <div style="padding:1.25rem;border-bottom:1px solid var(--border);">
                      <p style="font-size:0.875rem;font-weight:600;color:var(--text);">Registered Companies</p>
                    </div>
                    <div *ngFor="let c of companyService.companies()"
                         style="display:flex;align-items:center;gap:12px;padding:14px 1.25rem;border-bottom:1px solid var(--border);">
                      <div style="width:36px;height:36px;border-radius:var(--r-sm);background:var(--accent-soft);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">
                        {{companyService.getIcon(c.name)}}
                      </div>
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:0.9rem;font-weight:600;color:var(--text);">{{c.name}}</div>
                        <div style="font-size:0.75rem;color:var(--text-3);">{{c.industry}} · {{c.headquarters}}</div>
                      </div>
                      <a [routerLink]="['/company', c.slug]" class="btn btn-ghost btn-sm">View</a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Side Panels -->
              <aside style="display:flex;flex-direction:column;gap:1.25rem;">

                <!-- Quick Actions -->
                <div class="card" style="padding:1.25rem;">
                  <p class="sidebar-section-title" style="margin-bottom:1rem;">Quick Actions</p>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <a routerLink="/post/create" class="btn btn-primary btn-sm" style="justify-content:center;">+ New Post</a>
                    <button class="btn btn-ghost btn-sm" style="justify-content:center;">📊 Export Data</button>
                    <button class="btn btn-ghost btn-sm" style="justify-content:center;">🔄 Refresh Stats</button>
                  </div>
                </div>

                <!-- System Health -->
                <div class="card" style="padding:1.25rem;">
                  <p class="sidebar-section-title" style="margin-bottom:1rem;">System Health</p>
                  <div style="display:flex;flex-direction:column;gap:10px;">
                    <div *ngFor="let h of health" style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="font-size:0.875rem;color:var(--text-2);">{{h.name}}</span>
                      <span class="badge" [class.badge-green]="h.ok" [class.badge-red]="!h.ok">
                        {{h.ok ? '● Online' : '● Offline'}}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Recent Signups -->
                <div class="card" style="padding:1.25rem;">
                  <p class="sidebar-section-title" style="margin-bottom:1rem;">Recent Activity</p>
                  <div style="display:flex;flex-direction:column;gap:10px;">
                    <div *ngFor="let a of recentActivity" style="display:flex;align-items:center;gap:10px;">
                      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--indigo));display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:#fff;flex-shrink:0;">
                        {{a.initial}}
                      </div>
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:0.8125rem;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{a.action}}</div>
                        <div style="font-size:0.7rem;color:var(--text-3);">{{a.time}}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </aside>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  auth           = inject(AuthService);
  postService    = inject(PostService);
  companyService = inject(CompanyService);

  activeTab = 'posts';

  tabs = [
    { label: '📝 Posts',     value: 'posts'     },
    { label: '🏢 Companies', value: 'companies' },
  ];

  adminStats = [
    { icon: '📝', label: 'Total Posts',    value: '—',   trend: 12  },
    { icon: '👥', label: 'Users',          value: '—',   trend: 8   },
    { icon: '🏢', label: 'Companies',      value: '—',   trend: 5   },
    { icon: '💬', label: 'Comments',       value: '—',   trend: 20  },
  ];

  health = [
    { name: 'API Server',    ok: true  },
    { name: 'Database',      ok: true  },
    { name: 'Auth Service',  ok: true  },
    { name: 'Email Service', ok: false },
  ];

  recentActivity = [
    { initial: 'A', action: 'New post published', time: '2 min ago' },
    { initial: 'R', action: 'New user registered', time: '14 min ago' },
    { initial: 'S', action: 'Post flagged for review', time: '1 hour ago' },
    { initial: 'M', action: 'Company page updated', time: '3 hours ago' },
  ];

  ngOnInit() {
    this.postService.fetchPosts({ page: 0, size: 50, sort: 'latest' });
    this.companyService.fetchCompanies();

    // Update stats once data loads
    setTimeout(() => {
      this.adminStats[0].value = String(this.postService.posts().length);
      this.adminStats[2].value = String(this.companyService.companies().length);
    }, 1200);
  }

  deletePost(post: Post) {
    if (!post.id) return;
    if (confirm(`Delete "${post.title}"?`)) {
      this.postService.deletePost(post.id).subscribe();
    }
  }
}
