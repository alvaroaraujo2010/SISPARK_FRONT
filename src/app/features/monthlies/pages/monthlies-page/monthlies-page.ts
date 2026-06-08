import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../core/services/auth';
import { MonthliesService, MonthlyStatusFilter } from '../../../../core/services/monthlies';
import { AdminService } from '../../../../core/services/admin';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { KpiCard } from '../../../../shared/components/kpi-card/kpi-card';
import type { Monthly, VehicleType } from '../../../../core/models/api.types';

@Component({
  selector: 'app-monthlies-page',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    PageHeader,
    EmptyState,
    KpiCard,
  ],
  templateUrl: './monthlies-page.html',
  styleUrl: './monthlies-page.scss',
})
export class MonthliesPage {
  private readonly fb = inject(FormBuilder);
  private readonly monthliesService = inject(MonthliesService);
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;
  protected readonly searchTerm = signal('');
  protected readonly status = signal<MonthlyStatusFilter>('Vigentes');
  protected readonly onlyDueSoon = signal(true);
  protected readonly daysAhead = signal(7);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly vehicleTypesResource = rxResource<VehicleType[], undefined>({
    stream: () => this.adminService.getVehicleTypes(),
    defaultValue: [] as VehicleType[],
  });

  protected readonly monthliesResource = rxResource<
    Monthly[],
    { search: string; status: MonthlyStatusFilter; onlyDueSoon: boolean; daysAhead: number }
  >({
    params: () => ({
      search: this.searchTerm(),
      status: this.status(),
      onlyDueSoon: this.onlyDueSoon(),
      daysAhead: this.daysAhead(),
    }),
    stream: ({ params }) =>
      this.monthliesService.search(params.search, params.status, params.onlyDueSoon, params.daysAhead),
    defaultValue: [] as Monthly[],
  });

  protected readonly dueSoonCount = computed(() => this.monthliesResource.value().length);
  protected readonly dueSoonTotal = computed(() =>
    this.monthliesResource.value().reduce((acc, item) => acc + item.valor, 0),
  );
  protected readonly selectedMonthly = computed(() => {
    const id = this.selectedId();
    if (id === null) {
      return null;
    }
    return this.monthliesResource.value().find((item) => item.id === id) ?? null;
  });

  protected readonly renewForm = this.fb.nonNullable.group({
    newEndDate: ['', [Validators.required]],
    newValue: [0, [Validators.required, Validators.min(0.01)]],
    notes: [''],
  });

  protected readonly loadError = () => {
    if (this.monthliesResource.status() === 'error') {
      return getHttpErrorMessage(this.monthliesResource.error(), 'No fue posible cargar las mensualidades.');
    }
    if (this.vehicleTypesResource.status() === 'error') {
      return getHttpErrorMessage(this.vehicleTypesResource.error(), 'No fue posible cargar los tipos de vehiculo.');
    }
    return '';
  };

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected setStatus(value: MonthlyStatusFilter): void {
    this.status.set(value);
  }

  protected toggleDueSoon(value: boolean): void {
    this.onlyDueSoon.set(value);
  }

  protected selectMonthly(id: number): void {
    const item = this.monthliesResource.value().find((m) => m.id === id);
    if (!item) {
      return;
    }
    this.selectedId.set(id);
    this.error.set('');
    this.feedback.set('');
    const suggested = new Date(item.fechaFin);
    suggested.setMonth(suggested.getMonth() + 1);
    this.renewForm.reset({
      newEndDate: suggested.toISOString().slice(0, 10),
      newValue: item.valor,
      notes: '',
    });
  }

  protected clearSelection(): void {
    this.selectedId.set(null);
  }

  protected renew(): void {
    const id = this.selectedId();
    if (id === null || this.renewForm.invalid) {
      this.renewForm.markAllAsTouched();
      return;
    }

    const value = this.renewForm.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.monthliesService
      .renew(id, {
        newEndDate: value.newEndDate,
        newValue: value.newValue,
        notes: value.notes.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.feedback.set('Mensualidad renovada correctamente.');
          this.monthliesResource.reload();
          this.clearSelection();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(getHttpErrorMessage(err, 'No fue posible renovar la mensualidad.'));
        },
      });
  }

  protected cancel(): void {
    const id = this.selectedId();
    if (id === null) {
      return;
    }
    if (!confirm('Desea cancelar la mensualidad seleccionada?')) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.monthliesService.cancel(id).subscribe({
      next: () => {
        this.saving.set(false);
        this.feedback.set('Mensualidad cancelada.');
        this.monthliesResource.reload();
        this.clearSelection();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(getHttpErrorMessage(err, 'No fue posible cancelar la mensualidad.'));
      },
    });
  }
}
