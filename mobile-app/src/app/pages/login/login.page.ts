import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline, eyeOffOutline,
  lockClosedOutline, mailOutline,
  schoolOutline, logoGoogle, logoApple
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    IonSpinner
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor() {
    addIcons({
      eyeOutline, eyeOffOutline,
      lockClosedOutline, mailOutline,
      schoolOutline, logoGoogle, logoApple
    });

    this.form = this.fb.group({
      email: ['priya.sharma@student.in', [Validators.required, Validators.email]],
      password: ['Student@123', [Validators.required]]
    });
  }

  async onLogin(): Promise<void> {
    if (this.form.invalid) {
      this.errorMessage = 'Please enter valid email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        sessionStorage.setItem('studentId', res.data
          ? res.data.user._id
          : '');
        this.loading = false;
        // Small delay to ensure cookies are set and user state is updated
        setTimeout(() => {
          this.router.navigate(['/tabs/home']);
        }, 100);
      },
      error: (e) => {
        this.loading = false;
        this.errorMessage = e.error?.message || 'Login failed';
      }
    });
  }
}