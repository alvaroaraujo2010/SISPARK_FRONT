import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { ClientsService } from '../../../../core/services/clients';
import { AlertService } from '../../../../core/services/alert';
import { Auth } from '../../../../core/services/auth';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import type { ClientSummary } from '../../../../core/models/api.types';

@Component({
  selector: 'app-clients-page',
  imports: [ReactiveFormsModule, PageHeader, EmptyState],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
})
export class ClientsPage {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly searchTerm = signal('');
  protected readonly includeInactive = signal(false);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly feedback = signal('');
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  protected readonly clientsResource = rxResource<ClientSummary[], { search: string; includeInactive: boolean }>({
    params: () => ({ search: this.searchTerm(), includeInactive: this.includeInactive() }),
    stream: ({ params }) => this.clientsService.search(params.search, params.includeInactive),
    defaultValue: [] as ClientSummary[],
  });

  protected readonly selectedClient = computed(() => {
    const id = this.selectedId();
    if (id === null) {
      return null;
    }
    return this.clientsResource.value().find((item) => item.id === id) ?? null;
  });

  protected readonly editForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', [Validators.maxLength(30)]],
    email: ['', [Validators.maxLength(120), Validators.email]],
    address: ['', [Validators.maxLength(180)]],
    isActive: [true],
  });

  protected readonly loadError = () => {
    if (this.clientsResource.status() === 'error') {
      return getHttpErrorMessage(this.clientsResource.error(), 'No fue posible cargar los clientes.');
    }
    return '';
  };

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  protected toggleInactive(value: boolean): void {
    this.includeInactive.set(value);
  }

  protected selectClient(id: number): void {
    const client = this.clientsResource.value().find((item) => item.id === id);
    if (!client) {
      return;
    }
    this.selectedId.set(id);
    this.error.set('');
    this.feedback.set('');
    this.editForm.reset({
      fullName: client.nombreCompleto,
      phone: client.telefono,
      email: client.correo,
      address: client.direccion,
      isActive: client.isActive,
    });
  }

  protected clearSelection(): void {
    this.selectedId.set(null);
    this.editForm.reset({ fullName: '', phone: '', email: '', address: '', isActive: true });
  }

  protected save(): void {
    const id = this.selectedId();
    if (id === null || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const value = this.editForm.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.clientsService
      .update(id, {
        fullName: value.fullName.trim(),
        phone: value.phone.trim() || undefined,
        email: value.email.trim() || undefined,
        address: value.address.trim() || undefined,
        isActive: value.isActive,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          const message = 'Cliente actualizado correctamente.';
          this.feedback.set(message);
          void this.alert.success('Cliente actualizado', message);
          this.clientsResource.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          const message = getHttpErrorMessage(err, 'No fue posible actualizar el cliente.');
          this.error.set(message);
          void this.alert.error('Error al actualizar cliente', message);
        },
      });
  }
}
