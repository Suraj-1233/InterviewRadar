import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CompanyService } from '../../services/company.service';
import { NavComponent } from '../../components/nav/nav.component';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  postService    = inject(PostService);
  companyService = inject(CompanyService);

  activeSort      = 'latest';
  activeFilter    = 'all';
  currentPage     = 0;
  selectedCompany: Company | null = null;

  sortOptions = [
    { label: 'Latest',   value: 'latest'   },
    { label: 'Trending', value: 'trending' },
  ];

  resultFilters = [
    { label: 'All Posts',   value: 'all' },
    { label: 'Selected',    value: 'selected' },
    { label: 'Rejected',    value: 'rejected' },
    { label: 'Internships', value: 'intern' },
  ];

  stats = [
    { value: '5.4k+', label: 'Experiences Shared'  },
    { value: '1.2k+', label: 'Active Contributors' },
    { value: '200+',  label: 'Companies Covered'   },
  ];

  ngOnInit() {
    this.postService.fetchPosts({ page: 0, size: 10, sort: 'latest' });
    this.companyService.fetchCompanies();
  }

  setSort(sort: string) {
    this.activeSort  = sort;
    this.currentPage = 0;
    this.postService.fetchPosts({ page: 0, size: 10, sort: sort as any });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.currentPage = 0;
    this.applyFilters();
  }

  filterByCompany(company: Company) {
    if (this.selectedCompany?.id === company.id) {
      this.clearCompanyFilter();
      return;
    }
    this.selectedCompany = company;
    this.currentPage = 0;
    this.applyFilters();
  }

  clearCompanyFilter() {
    this.selectedCompany = null;
    this.currentPage = 0;
    this.applyFilters();
  }

  private applyFilters() {
    this.postService.fetchPosts({
      page: this.currentPage,
      size: 10,
      sort: this.activeSort as any,
      company: this.selectedCompany?.slug,
      // If active filter is "selected" or "rejected", map it to result. Otherwise ignore.
      // Alternatively, if active filter is "intern", we could map it to role, but our API doesn't support generic role search yet unless we use search endpoint.
      // For now, map 'selected' and 'rejected' to the difficulty/result enum.
      ...(this.activeFilter === 'selected' ? { result: 'Selected' as any } : {}),
      ...(this.activeFilter === 'rejected' ? { result: 'Rejected' as any } : {}),
    });
  }

  loadMore() {
    this.currentPage++;
    this.postService.fetchPosts(
      { page: this.currentPage, size: 10, sort: this.activeSort as any },
      true
    );
  }
}
