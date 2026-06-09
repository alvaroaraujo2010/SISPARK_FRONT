import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
import { AlertService } from '../../../../core/services/alert';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, DatePipe, PageHeader],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly saving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected submit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      const message = 'La confirmacion de la nueva contraseña no coincide.';
      this.error.set(message);
      void this.alert.info('Verifique la contraseña', message);
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.auth
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          const message = 'Contraseña actualizada correctamente.';
          this.feedback.set(message);
          void this.alert.success('Contraseña actualizada', message);
          this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          const message = getHttpErrorMessage(err, 'No fue posible cambiar la contraseña.');
          this.error.set(message);
          void this.alert.error('Error al cambiar contraseña', message);
        },
      });
  }
}
