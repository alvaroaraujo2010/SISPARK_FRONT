import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import type { ActiveVehicle, DashboardSummary } from '../../../../core/models/api.types';
import { AdminService } from '../../../../core/services/admin';
import { Auth } from '../../../../core/services/auth';
import { Parking } from '../../../../core/services/parking';

function formatCop(amount: number): string {
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly fb = inject(FormBuilder);
  private readonly parking = inject(Parking);
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;

  protected readonly dashboardResource = rxResource<DashboardSummary, undefined>({
    stream: () => this.adminService.getDashboardSummary(),
  });

  protected readonly vehiclesResource = rxResource<ActiveVehicle[], undefined>({
    stream: () => this.parking.getActiveVehicles(),
  });

  protected readonly searchQuery = signal('');

  protected readonly filteredActiveVehicles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const vehicles = this.vehiclesResource.value() ?? [];

    if (!query) {
      return vehicles;
    }

    return vehicles.filter(
      (vehicle) =>
        vehicle.placa.toLowerCase().includes(query) ||
        vehicle.tipoServicio.toLowerCase().includes(query),
    );
  });

  protected readonly plateForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.maxLength(15)]],
  });

  protected readonly isSubmittingMovement = signal(false);
  protected readonly movementError = signal('');
  protected readonly movementMessage = signal('');

  protected readonly summaryError = computed(() =>
    this.dashboardResource.status() === 'error'
      ? getHttpErrorMessage(
          this.dashboardResource.error(),
          'No fue posible cargar el resumen administrativo.',
        )
      : '',
  );

  protected readonly loadError = computed(() =>
    this.vehiclesResource.status() === 'error'
      ? getHttpErrorMessage(this.vehiclesResource.error(), 'No fue posible cargar los vehiculos activos.')
      : '',
  );

  protected submitPlate(): void {
    if (this.plateForm.invalid) {
      this.plateForm.markAllAsTouched();
      return;
    }

    this.isSubmittingMovement.set(true);
    this.movementError.set('');
    this.movementMessage.set('');

    const { plate } = this.plateForm.getRawValue();
    this.parking.registerEntryExit(plate.toUpperCase()).subscribe({
      next: (response) => {
        this.isSubmittingMovement.set(false);
        let msg = response.message;
        if (response.action === 'exit' && response.totalToPay != null) {
          msg = `${msg} · Total ${formatCop(response.totalToPay)}`;
        }
        this.movementMessage.set(msg);
        this.plateForm.reset();
        this.dashboardResource.reload();
        this.vehiclesResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingMovement.set(false);
        this.movementError.set(
          getHttpErrorMessage(error, 'No fue posible registrar el movimiento del vehiculo.'),
        );
      },
    });
  }

  protected refreshBoard(): void {
    this.dashboardResource.reload();
    this.vehiclesResource.reload();
  }

  protected updateSearch(query: string): void {
    this.searchQuery.set(query);
  }
}
