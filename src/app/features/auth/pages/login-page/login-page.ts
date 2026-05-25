import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { defaultAdminRoute } from '../../../../core/auth/roles';
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
  private readonly route = inject(ActivatedRoute);

  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.maxLength(100)]],
  });
  protected isSubmitting = false;
  protected errorMessage = '';
  protected successMessage = '';

  constructor() {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'session-expired') {
      this.errorMessage = 'Tu sesion expiro. Ingresa nuevamente para continuar.';
    }

    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.getRedirectUrl());
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
        void this.router.navigateByUrl(this.getRedirectUrl());
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(
          error,
          'No fue posible iniciar sesion. Verifica tus credenciales e intenta de nuevo.',
        );
      },
    });
  }

  private getRedirectUrl(): string {
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl');
    if (redirectUrl?.startsWith('/admin')) {
      return redirectUrl;
    }

    return defaultAdminRoute(this.auth.session()?.role);
  }
}
