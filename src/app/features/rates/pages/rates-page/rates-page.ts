import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../../core/services/admin';
import { RatesService } from '../../../../core/services/rates';
import { AlertService } from '../../../../core/services/alert';
import { Auth } from '../../../../core/services/auth';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import type { Rate, VehicleType } from '../../../../core/models/api.types';

@Component({
  selector: 'app-rates-page',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    PageHeader,
    EmptyState,
  ],
  templateUrl: './rates-page.html',
  styleUrl: './rates-page.scss',
})
export class RatesPage {
  private readonly fb = inject(FormBuilder);
  private readonly ratesService = inject(RatesService);
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly includeInactive = signal(false);
  protected readonly saving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly vehicleTypesResource = rxResource<VehicleType[], undefined>({
    stream: () => this.adminService.getVehicleTypes(),
    defaultValue: [] as VehicleType[],
  });

  protected readonly ratesResource = rxResource<Rate[], { includeInactive: boolean }>({
    params: () => ({ includeInactive: this.includeInactive() }),
    stream: ({ params }) => this.ratesService.list(params.includeInactive),
    defaultValue: [] as Rate[],
  });

  protected readonly rateForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    serviceTypeId: [1, [Validators.required, Validators.min(1)]],
    vehicleTypeId: [0, [Validators.required, Validators.min(1)]],
    value: [0, [Validators.required, Validators.min(0.01)]],
    fractionMinutes: [60, [Validators.min(1)]],
    freeToleranceMinutes: [0, [Validators.min(0)]],
    fullDayValue: [0, [Validators.min(0)]],
    nightStartTime: [''],
    nightEndTime: [''],
    nightValue: [0, [Validators.min(0)]],
    lostTicketSurcharge: [0, [Validators.min(0)]],
    makeActive: [true],
  });

  protected readonly loadError = () => {
    if (this.ratesResource.status() === 'error') {
      return getHttpErrorMessage(this.ratesResource.error(), 'No fue posible cargar las tarifas.');
    }
    if (this.vehicleTypesResource.status() === 'error') {
      return getHttpErrorMessage(this.vehicleTypesResource.error(), 'No fue posible cargar los tipos de vehiculo.');
    }
    return '';
  };

  protected toggleInactive(value: boolean): void {
    this.includeInactive.set(value);
  }

  protected applyVehicleType(id: number): void {
    this.rateForm.patchValue({ vehicleTypeId: id });
  }

  protected submit(): void {
    if (this.rateForm.invalid) {
      this.rateForm.markAllAsTouched();
      return;
    }

    const value = this.rateForm.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.ratesService
      .create({
        name: value.name.trim(),
        serviceTypeId: value.serviceTypeId,
        vehicleTypeId: value.vehicleTypeId,
        value: value.value,
        fractionMinutes: value.fractionMinutes ?? undefined,
        freeToleranceMinutes: this.optionalNumber(value.freeToleranceMinutes),
        fullDayValue: this.optionalNumber(value.fullDayValue),
        nightStartTime: value.nightStartTime || undefined,
        nightEndTime: value.nightEndTime || undefined,
        nightValue: this.optionalNumber(value.nightValue),
        lostTicketSurcharge: this.optionalNumber(value.lostTicketSurcharge),
        makeActive: value.makeActive,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          const message = 'Tarifa creada correctamente.';
          this.feedback.set(message);
          void this.alert.success('Tarifa creada', message);
          this.rateForm.reset({
            serviceTypeId: 1,
            vehicleTypeId: 0,
            value: 0,
            fractionMinutes: 60,
            freeToleranceMinutes: 0,
            fullDayValue: 0,
            nightStartTime: '',
            nightEndTime: '',
            nightValue: 0,
            lostTicketSurcharge: 0,
            makeActive: true,
          });
          this.ratesResource.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          const message = getHttpErrorMessage(err, 'No fue posible crear la tarifa.');
          this.error.set(message);
          void this.alert.error('Error al crear tarifa', message);
        },
      });
  }

  private optionalNumber(value: number | null | undefined): number | undefined {
    return value && value > 0 ? value : undefined;
  }
}
