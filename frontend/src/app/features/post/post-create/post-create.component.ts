import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../../components/nav/nav.component';
import { PostService } from '../../../services/post.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, PostType, DifficultyLevel, ResultStatus } from '../../../models/post.model';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavComponent],
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit {
  private postService  = inject(PostService);
  companyService       = inject(CompanyService);
  private auth         = inject(AuthService);
  private router       = inject(Router);

  submitting = false;
  errorMsg   = '';

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
    { value: 'InterviewExperience', label: 'Interview Experience', icon: '🎯', desc: 'Full round-by-round walkthrough' },
    { value: 'SalaryDiscussion',    label: 'Salary Discussion',    icon: '💰', desc: 'Package, comp & negotiation' },
    { value: 'HiringUpdate',        label: 'Hiring Update',        icon: '📢', desc: 'Job postings, freezes, news' },
    { value: 'OAReport',            label: 'OA Report',            icon: '📝', desc: 'Online assessment breakdown' },
  ];

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.companyService.fetchCompanies();
  }

  onSubmit() {
    if (!this.form.title || !this.form.content) return;
    this.submitting = true;
    this.errorMsg   = '';

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

      this.postService.createPost(payload as Post).subscribe({
        next: (p) => this.router.navigate(['/post', p.id]),
        error: (err) => {
          this.errorMsg  = err.error?.message || 'Failed to publish. Try again.';
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

  saveDraft() {
    this.form.draft = true;
    this.onSubmit();
  }
}
