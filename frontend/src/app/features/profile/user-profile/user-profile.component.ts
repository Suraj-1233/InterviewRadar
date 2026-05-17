import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../../../components/nav/nav.component';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page-wrapper">
      <div class="container" style="max-width:900px;padding-top:2.5rem;padding-bottom:4rem;">

        <div *ngIf="!auth.isLoggedIn()">
          <div class="card animate-fade-up" style="padding:4rem;text-align:center;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
            <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--text);margin-bottom:0.5rem;">Sign in to view your profile</h2>
            <p style="color:var(--text-3);margin-bottom:1.5rem;">Manage your posts, track activity and more.</p>
            <a routerLink="/login" class="btn btn-primary">Sign In</a>
          </div>
        </div>

        <div *ngIf="auth.isLoggedIn()">
          <div class="animate-fade-up" style="display:flex;flex-direction:column;gap:1.5rem;">

            <!-- Profile Hero -->
            <div class="card" style="padding:2.5rem;">
              <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;">

                <!-- Avatar -->
                <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--indigo));display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#fff;box-shadow:0 8px 24px var(--accent-glow);flex-shrink:0;">
                  {{auth.currentUser()?.username?.charAt(0)?.toUpperCase()}}
                </div>

                <!-- Info -->
                <div style="flex:1;min-width:200px;">
                  <h1 style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;color:var(--text);letter-spacing:-0.04em;margin-bottom:4px;">
                    {{auth.currentUser()?.fullName || auth.currentUser()?.username}}
                  </h1>
                  <p style="font-size:0.9375rem;color:var(--text-3);margin-bottom:0.75rem;">
                    @{{auth.currentUser()?.username}}
                  </p>
                  <div style="display:flex;gap:8px;">
                    <span *ngIf="auth.isAdmin()" class="badge badge-purple">Admin</span>
                    <span class="badge badge-indigo">Member</span>
                  </div>
                </div>

                <!-- Actions -->
                <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
                  <button (click)="editProfile()" class="btn btn-ghost btn-sm" style="width:100%;">Edit Profile</button>
                  <button (click)="auth.logout()" class="btn btn-sm"
                          style="background:var(--red-soft);color:var(--red);border:1px solid rgba(248,113,113,0.2);">
                    Sign Out
                  </button>
                </div>
              </div>

              <!-- Stats -->
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:2rem;padding-top:2rem;border-top:1px solid var(--border);">
                <div *ngFor="let s of profileStats" style="text-align:center;">
                  <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--text);letter-spacing:-0.02em;">{{s.value}}</div>
                  <div style="font-size:0.75rem;color:var(--text-3);margin-top:2px;">{{s.label}}</div>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:4px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--r-md);padding:4px;width:fit-content;">
              <button *ngFor="let tab of tabs" (click)="activeTab = tab.value" class="btn btn-sm"
                      [style.background]="activeTab === tab.value ? 'var(--accent)' : 'transparent'"
                      [style.color]="activeTab === tab.value ? '#fff' : 'var(--text-3)'"
                      style="border:none;">
                {{tab.label}}
              </button>
            </div>

            <!-- My Posts Tab -->
            <div *ngIf="activeTab === 'posts'">
              <div *ngIf="postService.loading()">
                <div style="display:flex;flex-direction:column;gap:1rem;">
                  <div *ngFor="let i of [1,2]" class="card" style="padding:1.5rem;">
                    <div class="skeleton" style="height:18px;width:70%;margin-bottom:10px;"></div>
                    <div class="skeleton" style="height:14px;margin-bottom:8px;"></div>
                    <div class="skeleton" style="height:14px;width:60%;"></div>
                  </div>
                </div>
              </div>
              <div *ngIf="!postService.loading() && myPosts.length === 0" class="card" style="padding:3rem;text-align:center;">
                <div style="font-size:2.5rem;margin-bottom:10px;">✍️</div>
                <h3 style="font-family:var(--font-display);font-size:1.125rem;font-weight:700;color:var(--text);margin-bottom:0.5rem;">No posts yet</h3>
                <p style="color:var(--text-3);font-size:0.9rem;margin-bottom:1.25rem;">Share your first interview experience!</p>
                <a routerLink="/post/create" class="btn btn-primary btn-sm">+ Write Experience</a>
              </div>
              <div *ngIf="!postService.loading() && myPosts.length > 0" style="display:flex;flex-direction:column;gap:1rem;">
                <div *ngFor="let post of myPosts" class="card" style="padding:1.5rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;">
                  <div style="min-width:0;">
                    <h3 style="font-family:var(--font-display);font-size:1rem;font-weight:700;color:var(--text);margin-bottom:4px;">{{post.title}}</h3>
                    <div style="font-size:0.8125rem;color:var(--text-3);display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <span *ngIf="post.companyName" style="color:#a78bfa;">{{post.companyName}}</span>
                      <span>{{post.createdAt | date:'MMM d, y'}}</span>
                      <span *ngIf="post.draft" class="badge badge-amber">Draft</span>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;flex-shrink:0;">
                    <a [routerLink]="['/post', post.id]" class="btn btn-ghost btn-sm">View</a>
                    <a [routerLink]="['/post', post.id, 'edit']" class="btn btn-ghost btn-sm">Edit</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Tab -->
            <div *ngIf="activeTab === 'activity'">
              <div class="card" style="padding:2rem;">
                <div style="display:flex;flex-direction:column;gap:1rem;">
                  <div *ngFor="let a of recentActivity" style="display:flex;align-items:center;gap:12px;padding-bottom:1rem;border-bottom:1px solid var(--border);">
                    <div style="width:36px;height:36px;border-radius:var(--r-sm);background:var(--accent-soft);border:1px solid rgba(124,58,237,0.2);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">
                      {{a.icon}}
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:0.9rem;color:var(--text-2);">{{a.text}}</div>
                      <div style="font-size:0.75rem;color:var(--text-3);margin-top:2px;">{{a.time}}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,
})
export class UserProfileComponent implements OnInit {
  auth        = inject(AuthService);
  postService = inject(PostService);

  activeTab = 'posts';
  myPosts: Post[] = [];

  tabs = [
    { label: '📝 My Posts',  value: 'posts'    },
    { label: '⚡ Activity',  value: 'activity'  },
  ];

  profileStats = [
    { value: '—', label: 'Posts'     },
    { value: '—', label: 'Views'     },
    { value: '—', label: 'Upvotes'   },
    { value: '—', label: 'Comments'  },
  ];

  recentActivity = [
    { icon: '📝', text: 'Posted "Google SDE-1 Interview Experience"',   time: '2 days ago' },
    { icon: '👍', text: 'Upvoted "Amazon System Design Round"',          time: '3 days ago' },
    { icon: '💬', text: 'Commented on "Flipkart Backend Interview"',    time: '5 days ago' },
    { icon: '🎯', text: 'Joined InterviewRadar',                         time: '1 week ago' },
  ];

  ngOnInit() {
    if (!this.auth.isLoggedIn()) return;
    // Load user's posts (all posts filtered client-side by authorName)
    this.postService.fetchPosts({ page: 0, size: 50, sort: 'latest' });
    setTimeout(() => {
      const username = this.auth.currentUser()?.username;
      this.myPosts = this.postService.posts().filter(p =>
        !p.anonymous && p.authorName === username
      );
      this.profileStats[0].value = String(this.myPosts.length);
    }, 1000);
  }

  editProfile() {
    const user = this.auth.currentUser();
    if (!user) return;
    const newName = window.prompt('Enter your full name:', user.fullName || user.username);
    if (newName !== null && newName.trim() !== '') {
      this.auth.updateProfile({ fullName: newName.trim() }).subscribe();
    }
  }
}
