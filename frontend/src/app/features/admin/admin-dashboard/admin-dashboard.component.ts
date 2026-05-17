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
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  auth           = inject(AuthService);
  postService    = inject(PostService);
  companyService = inject(CompanyService);

  activeTab = 'posts';

  tabs = [
    { label: 'Posts',     value: 'posts'     },
    { label: 'Companies', value: 'companies' },
  ];

  adminStats = [
    { label: 'Total Posts',    value: '—',   trend: 12  },
    { label: 'Users',          value: '—',   trend: 8   },
    { label: 'Companies',      value: '—',   trend: 5   },
    { label: 'Comments',       value: '—',   trend: 20  },
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
