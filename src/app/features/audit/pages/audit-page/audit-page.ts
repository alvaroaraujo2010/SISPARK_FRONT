import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuditService } from '../../../../core/services/audit';
import { Auth } from '../../../../core/services/auth';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import type { AuditEntry } from '../../../../core/models/api.types';

@Component({
  selector: 'app-audit-page',
  imports: [ReactiveFormsModule, DatePipe, PageHeader, EmptyState],
  templateUrl: './audit-page.html',
  styleUrl: './audit-page.scss',
})
export class AuditPage {
  private readonly fb = inject(FormBuilder);
  private readonly auditService = inject(AuditService);
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly modulo = signal('');
  protected readonly accion = signal('');

  protected readonly auditResource = rxResource<AuditEntry[], { from: string; to: string; modulo: string; accion: string }>({
    params: () => ({
      from: this.from(),
      to: this.to(),
      modulo: this.modulo(),
      accion: this.accion(),
    }),
    stream: ({ params }) =>
      this.auditService.search(
        params.from || undefined,
        params.to || undefined,
        undefined,
        params.modulo || undefined,
        params.accion || undefined,
        500,
      ),
    defaultValue: [] as AuditEntry[],
  });

  protected readonly loadError = () => {
    if (this.auditResource.status() === 'error') {
      return getHttpErrorMessage(this.auditResource.error(), 'No fue posible cargar la bitacora.');
    }
    return '';
  };

  protected setFrom(value: string): void {
    this.from.set(value);
  }

  protected setTo(value: string): void {
    this.to.set(value);
  }

  protected setModulo(value: string): void {
    this.modulo.set(value);
  }

  protected setAccion(value: string): void {
    this.accion.set(value);
  }
}
