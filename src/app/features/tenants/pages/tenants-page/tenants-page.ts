import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { TenantsService } from '../../../../core/services/tenants';
import { AlertService } from '../../../../core/services/alert';
import { Auth } from '../../../../core/services/auth';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-tenants-page',
  imports: [ReactiveFormsModule, DatePipe, PageHeader, EmptyState],
  templateUrl: './tenants-page.html',
  styleUrl: './tenants-page.scss',
})
export class TenantsPage {
  private readonly fb = inject(FormBuilder);
  private readonly tenantsService = inject(TenantsService);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly isSaving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly tenantsResource = rxResource({
    stream: () => this.tenantsService.getTenants(),
    defaultValue: [],
  });

  protected readonly tenantForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-z0-9-]+$/)]],
    adminUsername: ['', [Validators.required, Validators.maxLength(50)]],
    adminPassword: ['', [Validators.required, Validators.minLength(6)]],
    adminEmail: ['', [Validators.email]],
  });

  protected submit(): void {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }

    const raw = this.tenantForm.getRawValue();
    this.isSaving.set(true);
    this.feedback.set('');
    this.error.set('');

    this.tenantsService.create({
      nombre: raw.nombre.trim(),
      slug: raw.slug.trim().toLowerCase(),
      adminUsername: raw.adminUsername.trim().toLowerCase(),
      adminPassword: raw.adminPassword,
      adminEmail: raw.adminEmail.trim() || '',
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        const message = 'Empresa creada correctamente.';
        this.feedback.set(message);
        void this.alert.success('Empresa creada', message);
        this.tenantForm.reset();
        this.tenantsResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        const message = getHttpErrorMessage(err, 'No fue posible crear la empresa.');
        this.error.set(message);
        void this.alert.error('Error al crear empresa', message);
      },
    });
  }
}
