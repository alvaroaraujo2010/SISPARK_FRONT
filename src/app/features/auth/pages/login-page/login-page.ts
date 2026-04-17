import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
  });
  protected isSubmitting = false;
  protected errorMessage = '';
  protected successMessage = '';

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/admin/inicio');
    }
  }

  protected login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, password } = this.loginForm.getRawValue();
    this.auth.login(username, password).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = `Bienvenido, ${response.fullName}.`;
        void this.router.navigateByUrl('/admin/inicio');
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message ??
          'No fue posible iniciar sesion. Verifica tus credenciales e intenta de nuevo.';
      },
    });
  }
}
