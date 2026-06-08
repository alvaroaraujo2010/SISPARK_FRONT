import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { roleLabel } from '../../../../core/auth/roles';
import { UsersService } from '../../../../core/services/users';
import { Auth } from '../../../../core/services/auth';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import type { RoleOption, UserAccount } from '../../../../core/models/api.types';

@Component({
  selector: 'app-users-page',
  imports: [ReactiveFormsModule, DatePipe, PageHeader, EmptyState],
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
  protected readonly selectedId = signal<number | null>(null);
  protected readonly resettingId = signal<number | null>(null);
  protected readonly resetPassword = signal('');

  protected readonly rolesResource = rxResource<RoleOption[], undefined>({
    stream: () => this.usersService.getRoles(),
    defaultValue: [] as RoleOption[],
  });

  protected readonly usersResource = rxResource<UserAccount[], undefined>({
    stream: () => this.usersService.getUsers(),
    defaultValue: [] as UserAccount[],
  });

  protected readonly selectedUser = computed(() => {
    const id = this.selectedId();
    if (id === null) {
      return null;
    }
    return this.usersResource.value().find((u) => u.id === id) ?? null;
  });

  protected readonly userForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', Validators.email],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    roleId: [0, [Validators.required, Validators.min(1)]],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.email]],
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

  protected selectUser(id: number): void {
    const user = this.usersResource.value().find((u) => u.id === id);
    if (!user) {
      return;
    }
    this.selectedId.set(id);
    this.error.set('');
    this.feedback.set('');
    this.resettingId.set(null);
    this.resetPassword.set('');
    this.editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email ?? '',
      roleId: user.roleId,
    });
  }

  protected clearSelection(): void {
    this.selectedId.set(null);
    this.resettingId.set(null);
  }

  protected saveEdit(): void {
    const id = this.selectedId();
    if (id === null || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const raw = this.editForm.getRawValue();
    this.isSaving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.usersService
      .updateUser(id, {
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        email: raw.email.trim() || undefined,
        roleId: raw.roleId,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.feedback.set('Usuario actualizado.');
          this.usersResource.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving.set(false);
          this.error.set(getHttpErrorMessage(err, 'No fue posible actualizar el usuario.'));
        },
      });
  }

  protected toggleActive(): void {
    const id = this.selectedId();
    const user = this.selectedUser();
    if (id === null || !user) {
      return;
    }
    const nextState = !user.isActive;
    this.isSaving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.usersService.setActive(id, nextState).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.feedback.set(nextState ? 'Usuario activado.' : 'Usuario desactivado.');
        this.usersResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.error.set(getHttpErrorMessage(err, 'No fue posible cambiar el estado del usuario.'));
      },
    });
  }

  protected startReset(id: number): void {
    this.resettingId.set(id);
    this.resetPassword.set('');
  }

  protected cancelReset(): void {
    this.resettingId.set(null);
    this.resetPassword.set('');
  }

  protected confirmReset(): void {
    const id = this.resettingId();
    if (id === null) {
      return;
    }
    if (this.resetPassword().length < 6) {
      this.error.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    this.isSaving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.usersService.resetPassword(id, { newPassword: this.resetPassword() }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.feedback.set('Contraseña restablecida.');
        this.resettingId.set(null);
        this.resetPassword.set('');
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.error.set(getHttpErrorMessage(err, 'No fue posible restablecer la contraseña.'));
      },
    });
  }
}
