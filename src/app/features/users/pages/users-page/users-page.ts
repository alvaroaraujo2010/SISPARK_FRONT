import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { roleLabel } from '../../../../core/auth/roles';
import { UsersService } from '../../../../core/services/users';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-users-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;
  protected readonly roleLabel = roleLabel;
  protected readonly isSaving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly rolesResource = rxResource({
    stream: () => this.usersService.getRoles(),
  });

  protected readonly usersResource = rxResource({
    stream: () => this.usersService.getUsers(),
  });

  protected readonly userForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', Validators.email],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    roleId: [0, [Validators.required, Validators.min(1)]],
  });

  protected readonly loadError = () => {
    if (this.rolesResource.status() === 'error') {
      return getHttpErrorMessage(this.rolesResource.error(), 'No fue posible cargar los roles.');
    }

    if (this.usersResource.status() === 'error') {
      return getHttpErrorMessage(this.usersResource.error(), 'No fue posible cargar los usuarios.');
    }

    return '';
  };

  protected submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const raw = this.userForm.getRawValue();
    this.isSaving.set(true);
    this.feedback.set('');
    this.error.set('');

    this.usersService
      .createUser({
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        username: raw.username.trim().toLowerCase(),
        email: raw.email.trim() || undefined,
        password: raw.password,
        roleId: raw.roleId,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.feedback.set('Usuario creado correctamente.');
          this.userForm.reset({ roleId: 0 });
          this.usersResource.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving.set(false);
          this.error.set(getHttpErrorMessage(err, 'No fue posible crear el usuario.'));
        },
      });
  }
}
