import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../../components/nav/nav.component';
import { PostService } from '../../../services/post.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavComponent],
  templateUrl: './post-edit.component.html',
  styleUrl: './post-edit.component.css'
})
export class PostEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private cdr = inject(ChangeDetectorRef);
  companyService = inject(CompanyService);

  postId = '';
  loading = false;
  submitting = false;
  errorMsg = '';

  customCompany = '';
  customDifficulty = '';
  customResult = '';
  customCurrency = '';

  form: Partial<Post> & { currency: string } = {
    title: '',
    content: '',
    type: 'InterviewExperience',
    companyId: '',
    role: '',
    location: '',
    difficulty: undefined,
    result: undefined,
    salaryPackage: undefined,
    anonymous: false,
    draft: false,
    currency: 'INR',
  };

  postTypes = [
    { value: 'InterviewExperience', label: 'Interview Experience', desc: 'Full round-by-round walkthrough' },
    { value: 'SalaryDiscussion', label: 'Salary Discussion', desc: 'Package, comp & negotiation' },
    { value: 'HiringUpdate', label: 'Hiring Update', desc: 'Job postings, freezes, news' },
    { value: 'OAReport', label: 'OA Report', desc: 'Online assessment breakdown' },
  ];

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.postId) {
      this.router.navigate(['/']);
      return;
    }

    this.companyService.fetchCompanies();

    this.postService.getById(this.postId).subscribe({
      next: (post) => {
        console.log('✅ API returned post successfully:', post);

        const standardDifficulties = ['Easy', 'Medium', 'Hard'];
        const standardResults = ['Selected', 'Rejected', 'Waitlisted', 'Pending'];
        const standardCurrencies = ['INR', 'USD', 'EUR'];

        let formDifficulty = post?.difficulty || undefined;
        if (post?.difficulty && !standardDifficulties.includes(post.difficulty)) {
          formDifficulty = 'other';
          this.customDifficulty = post.difficulty;
        }

        let formResult = post?.result || undefined;
        if (post?.result && !standardResults.includes(post.result)) {
          formResult = 'other';
          this.customResult = post.result;
        }

        let formCurrency = post?.currency || 'INR';
        if (post?.currency && !standardCurrencies.includes(post.currency)) {
          formCurrency = 'other';
          this.customCurrency = post.currency;
        }

        this.form = {
          title: post?.title || '',
          content: post?.content || '',
          type: post?.type || 'InterviewExperience',
          companyId: post?.companyId || '',
          role: post?.role || '',
          location: post?.location || '',
          difficulty: formDifficulty,
          result: formResult,
          salaryPackage: post?.salaryPackage,
          currency: formCurrency,
          anonymous: post?.anonymous || false,
          draft: post?.draft || false
        };
        console.log('✅ Form initialized successfully:', this.form);
        
        this.loading = false;
        this.cdr.detectChanges(); // Force Angular to update the UI immediately
      },
      error: (err) => {
        console.error('❌ API failed:', err);
        this.loading = false;
        this.errorMsg = err.status === 403
          ? 'You do not have permission to edit this post.'
          : 'Failed to load post. Is the backend running?';
      }
    });
  }

  onSubmit() {
    if (!this.form.title || !this.form.content) return;
    this.submitting = true;
    this.errorMsg = '';

    const processSubmit = (finalCompanyId: string | undefined) => {
      const payload: any = { ...this.form };
      
      if (finalCompanyId) {
        payload.companyId = finalCompanyId;
      } else {
        delete payload.companyId;
      }

      if (this.form.difficulty === 'other') {
        payload.difficulty = this.customDifficulty || undefined;
      }
      if (!payload.difficulty) delete payload.difficulty;

      if (this.form.result === 'other') {
        payload.result = this.customResult || undefined;
      }
      if (!payload.result) delete payload.result;

      if (this.form.currency === 'other') {
        payload.currency = this.customCurrency || 'INR';
      }

      if (!payload.role) delete payload.role;
      if (!payload.location) delete payload.location;
      if (!payload.salaryPackage) delete payload.salaryPackage;

      this.postService.updatePost(this.postId, payload as Post).subscribe({
        next: (p) => this.router.navigate(['/post', p.id]),
        error: (err) => {
          this.errorMsg = err.error?.message || 'Failed to update. Try again.';
          this.submitting = false;
        }
      });
    };

    if (this.form.companyId === 'other' && this.customCompany.trim()) {
      this.companyService.createCompany(this.customCompany.trim()).subscribe({
        next: (newCompany) => {
          processSubmit(newCompany.id);
        },
        error: (err) => {
          this.errorMsg = 'Failed to create new custom company.';
          this.submitting = false;
        }
      });
    } else {
      processSubmit(this.form.companyId);
    }
  }
}
