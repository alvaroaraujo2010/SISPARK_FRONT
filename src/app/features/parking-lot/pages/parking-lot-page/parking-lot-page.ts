import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { AdminService } from '../../../../core/services/admin';
import { Auth } from '../../../../core/services/auth';
import { AlertService } from '../../../../core/services/alert';

@Component({
  selector: 'app-parking-lot-page',
  imports: [ReactiveFormsModule],
  templateUrl: './parking-lot-page.html',
  styleUrl: './parking-lot-page.scss',
})
export class ParkingLotPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly isSaving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly lotResource = rxResource({
    stream: () => this.adminService.getParkingLot(),
  });

  protected readonly lotForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    phone: ['', Validators.maxLength(30)],
    mobilePhone: ['', [Validators.required, Validators.maxLength(30)]],
    hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
    fractionMinutes: [60, [Validators.required, Validators.min(1), Validators.max(1440)]],
    totalCapacity: [4, [Validators.required, Validators.min(1), Validators.max(10000)]],
  });

  constructor() {
    effect(() => {
      const lot = this.lotResource.value();
      if (!lot) {
        return;
      }

      this.lotForm.patchValue({
        name: lot.name,
        address: lot.address,
        phone: lot.phone,
        mobilePhone: lot.mobilePhone,
        hourlyRate: lot.hourlyRate,
        fractionMinutes: lot.fractionMinutes,
        totalCapacity: lot.totalCapacity,
      });
    });
  }

  protected readonly loadError = () =>
    this.lotResource.status() === 'error'
      ? getHttpErrorMessage(this.lotResource.error(), 'No fue posible cargar los datos del parqueadero.')
      : '';

  protected submit(): void {
    if (this.lotForm.invalid) {
      this.lotForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.feedback.set('');
    this.error.set('');

    this.adminService.updateParkingLot(this.lotForm.getRawValue()).subscribe({
      next: () => {
        this.isSaving.set(false);
        const message = 'Datos del parqueadero guardados correctamente.';
        this.feedback.set(message);
        void this.alert.success('Parqueadero actualizado', message);
        this.lotResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        const message = getHttpErrorMessage(err, 'No fue posible guardar los datos del parqueadero.');
        this.error.set(message);
        void this.alert.error('Error al guardar parqueadero', message);
      },
    });
  }
}
