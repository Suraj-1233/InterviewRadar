import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavComponent } from '../../../components/nav/nav.component';
import { CompanyService } from '../../../services/company.service';
import { PostService } from '../../../services/post.service';
import { Company } from '../../../models/company.model';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  templateUrl: './company-page.component.html',
  styleUrl: './company-page.component.css'
})
export class CompanyPageComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  companyService = inject(CompanyService);
  postService    = inject(PostService);

  company: Company | null = null;
  loading = true;

  companyStats = [
    { value: '—', label: 'Experiences' },
    { value: '—', label: 'Selection Rate' },
    { value: '—', label: 'Avg Difficulty' },
  ];

  resultBreakdown = [
    { label: 'Selected',  count: 0 },
    { label: 'Rejected',  count: 0 },
    { label: 'Other',     count: 0 },
  ];

  commonRoles = ['SDE-1', 'SDE-2', 'Data Scientist', 'PM', 'SRE', 'ML Engineer'];

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) { this.loading = false; return; }

    this.companyService.getBySlug(slug).subscribe({
      next: (c) => {
        this.company = c;
        this.loading = false;
        // Load posts for this company
        this.postService.fetchPosts({ page: 0, size: 20, sort: 'latest', company: slug });
      },
      error: () => { this.loading = false; }
    });
  }
}
