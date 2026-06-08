import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
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
      this.error.set('La confirmacion de la nueva contraseña no coincide.');
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
          this.feedback.set('Contraseña actualizada correctamente.');
          this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(getHttpErrorMessage(err, 'No fue posible cambiar la contraseña.'));
        },
      });
  }
}
