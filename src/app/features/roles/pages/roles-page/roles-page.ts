import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RolesService } from '../../../../core/services/roles';
import { Auth } from '../../../../core/services/auth';
import { AlertService } from '../../../../core/services/alert';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import type { Permission, RolePermission } from '../../../../core/models/api.types';

@Component({
  selector: 'app-roles-page',
  imports: [CommonModule, ReactiveFormsModule, PageHeader],
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.scss',
})
export class RolesPage {
  private readonly fb = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly selectedRoleId = signal<number | null>(null);
  protected readonly selectedPermissions = signal<string[]>([]);
  protected readonly saving = signal(false);

  protected readonly rolesResource = rxResource<RolePermission[], number>({
    params: () => 0,
    stream: () => this.rolesService.getRoles(),
    defaultValue: [] as RolePermission[],
  });

  protected readonly permissionsResource = rxResource<Permission[], number>({
    params: () => 0,
    stream: () => this.rolesService.getPermissions(),
    defaultValue: [] as Permission[],
  });

  protected readonly roleForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(150)]],
    isActive: [true],
  });

  protected readonly selectedRole = computed(() => {
    const id = this.selectedRoleId();
    return this.rolesResource.value().find((role) => role.id === id) ?? null;
  });

  protected readonly groupedPermissions = computed(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of this.permissionsResource.value()) {
      const list = groups.get(permission.module) ?? [];
      list.push(permission);
      groups.set(permission.module, list);
    }
    return Array.from(groups.entries()).map(([module, permissions]) => ({ module, permissions }));
  });

  protected selectRole(role: RolePermission): void {
    this.selectedRoleId.set(role.id);
    this.selectedPermissions.set([...role.permissions]);
    this.roleForm.reset({
      name: role.name,
      description: role.description,
      isActive: role.isActive,
    });
  }

  protected newRole(): void {
    this.selectedRoleId.set(null);
    this.selectedPermissions.set([]);
    this.roleForm.reset({ name: '', description: '', isActive: true });
  }

  protected hasPermission(code: string): boolean {
    return this.selectedPermissions().includes(code);
  }

  protected togglePermission(code: string, checked: boolean): void {
    const current = new Set(this.selectedPermissions());
    if (checked) {
      current.add(code);
    } else {
      current.delete(code);
    }
    this.selectedPermissions.set(Array.from(current));
  }

  protected saveRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const raw = this.roleForm.getRawValue();
    const selectedId = this.selectedRoleId();
    this.saving.set(true);

    const request$ = selectedId === null
      ? this.rolesService.create({
          name: raw.name.trim(),
          description: raw.description.trim(),
          isActive: raw.isActive,
          permissions: this.selectedPermissions(),
        })
      : this.rolesService.update(selectedId, {
          name: raw.name.trim(),
          description: raw.description.trim(),
          isActive: raw.isActive,
        });

    request$.subscribe({
      next: (role) => {
        const afterSave$ = selectedId === null
          ? this.rolesService.updatePermissions(role.id, this.selectedPermissions())
          : this.rolesService.updatePermissions(role.id, this.selectedPermissions());

        afterSave$.subscribe({
          next: (updated) => {
            this.saving.set(false);
            this.rolesResource.reload();
            this.selectRole(updated);
            void this.alert.success('Rol guardado', 'Los permisos del rol fueron actualizados correctamente.');
          },
          error: (error: HttpErrorResponse) => this.handleError(error),
        });
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.saving.set(false);
    void this.alert.error('Error en roles', getHttpErrorMessage(error, 'No fue posible guardar el rol.'));
  }
}
