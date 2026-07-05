import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  
  features = [
    { icon: 'bi bi-play-circle', title: 'Video Management', desc: 'Upload and manage educational videos' },
    { icon: 'bi bi-file-earmark-pdf', title: 'PDF Resources', desc: 'Share study materials easily' },
    { icon: 'bi bi-clipboard-check', title: 'Quiz System', desc: 'Create and track student assessments' }
  ];
  
  stats = [
    { value: '10K+', label: 'Students' },
    { value: '500+', label: 'Videos' },
    { value: '95%', label: 'Satisfaction' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['admin@drseducation.in', [Validators.required, Validators.email]],
      password: ['Admin@123', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (res) => {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this.isLoading = false;
        // Small delay to ensure cookies are set and user state is updated
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password';
      }
    });
  }
}
