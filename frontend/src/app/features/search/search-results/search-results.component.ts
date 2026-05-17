import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../../components/nav/nav.component';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private postSvc  = inject(PostService);

  query         = '';
  loading       = false;
  activeFilter  = 'all';
  allPosts: Post[] = [];
  filteredPosts: Post[] = [];

  filters = [
    { label: 'All',        value: 'all'      },
    { label: 'Selected', value: 'Selected' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Easy',       value: 'Easy'     },
    { label: 'Hard',       value: 'Hard'     },
  ];

  trending = ['Google SDE', 'Amazon SDE-2', 'System Design', 'DSA', 'Infosys', 'Flipkart PM', 'Microsoft Internship'];

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) { this.query = q; }
    this.loadAllPosts();
  }

  loadAllPosts() {
    this.loading = true;
    this.postSvc.fetchPosts({ page: 0, size: 50, sort: 'latest' });
    // Subscribe to posts signal change
    setTimeout(() => {
      this.allPosts     = this.postSvc.posts();
      this.filteredPosts = this.allPosts;
      this.loading      = false;
      if (this.query) this.applyFilter();
    }, 800);
  }

  onSearch() {
    this.applyFilter();
  }

  applyFilter() {
    let results = [...this.allPosts];
    if (this.query.trim()) {
      const q = this.query.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.companyName || '').toLowerCase().includes(q) ||
        (p.role || '').toLowerCase().includes(q)
      );
    }
    if (this.activeFilter !== 'all') {
      results = results.filter(p =>
        p.result === this.activeFilter || p.difficulty === this.activeFilter
      );
    }
    this.filteredPosts = results;
  }

  highlight(text: string): string {
    if (!this.query.trim()) return text;
    const q = this.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${q})`, 'gi'),
      '<mark style="background:rgba(124,58,237,0.25);color:#c4b5fd;border-radius:3px;padding:0 2px;">$1</mark>');
  }
}
