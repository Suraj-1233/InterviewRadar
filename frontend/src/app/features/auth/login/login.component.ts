import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
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
