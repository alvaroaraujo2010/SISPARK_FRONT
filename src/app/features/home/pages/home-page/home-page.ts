import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardSummary } from '../../../../core/services/admin';
import { ActiveVehicle, Parking } from '../../../../core/services/parking';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly parking = inject(Parking);
  private readonly adminService = inject(AdminService);

  protected readonly activeVehicles = signal<ActiveVehicle[]>([]);
  protected readonly dashboardSummary = signal<DashboardSummary | null>(null);
  protected readonly plateForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.maxLength(6)]],
  });
  protected readonly isLoadingVehicles = signal(true);
  protected readonly isLoadingSummary = signal(true);
  protected readonly isSubmittingMovement = signal(false);
  protected readonly loadError = signal('');
  protected readonly summaryError = signal('');
  protected readonly movementError = signal('');
  protected readonly movementMessage = signal('');

  ngOnInit(): void {
    this.loadDashboardSummary();
    this.loadActiveVehicles();
  }

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
        this.movementMessage.set(response.message);
        this.plateForm.reset();
        this.loadActiveVehicles();
        this.loadDashboardSummary();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingMovement.set(false);
        this.movementError.set(
          error.error?.message ?? 'No fue posible registrar el movimiento del vehiculo.',
        );
      },
    });
  }

  protected loadActiveVehicles(): void {
    this.isLoadingVehicles.set(true);
    this.loadError.set('');

    this.parking.getActiveVehicles().subscribe({
      next: (vehicles) => {
        this.activeVehicles.set(vehicles);
        this.isLoadingVehicles.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingVehicles.set(false);
        this.loadError.set(error.error?.message ?? 'No fue posible cargar los vehiculos activos.');
      },
    });
  }

  protected loadDashboardSummary(): void {
    this.isLoadingSummary.set(true);
    this.summaryError.set('');

    this.adminService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.dashboardSummary.set(summary);
        this.isLoadingSummary.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingSummary.set(false);
        this.summaryError.set(
          error.error?.message ?? 'No fue posible cargar el resumen administrativo.',
        );
      },
    });
  }
}
