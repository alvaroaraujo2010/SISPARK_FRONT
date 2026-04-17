import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, VehicleType } from '../../../../core/services/admin';

@Component({
  selector: 'app-services-page',
  imports: [ReactiveFormsModule],
  templateUrl: './services-page.html',
  styleUrl: './services-page.scss',
})
export class ServicesPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);

  protected readonly vehicleForm = this.fb.nonNullable.group({
    identificationType: ['', Validators.required],
    identificationNumber: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: [''],
    plate: ['', [Validators.required, Validators.maxLength(6)]],
    brand: ['', Validators.required],
    vehicleModel: ['', Validators.required],
    color: [''],
    vehicleTypeId: [0, Validators.min(1)],
    paymentType: ['', Validators.required],
    comments: [''],
  });
  protected vehicleTypes: VehicleType[] = [];
  protected isSubmitting = false;
  protected successMessage = '';
  protected errorMessage = '';

  constructor() {
    this.loadVehicleTypes();
  }

  protected submitPreview(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      ...this.vehicleForm.getRawValue(),
      plate: this.vehicleForm.getRawValue().plate.toUpperCase(),
    };

    this.adminService.registerVehicle(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Cliente y vehiculo registrados correctamente.';
        this.vehicleForm.reset({
          identificationType: '',
          identificationNumber: '',
          fullName: '',
          email: '',
          phone: '',
          address: '',
          plate: '',
          brand: '',
          vehicleModel: '',
          color: '',
          vehicleTypeId: 0,
          paymentType: '',
          comments: '',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message ?? 'No fue posible guardar el registro del cliente y del vehiculo.';
      },
    });
  }

  private loadVehicleTypes(): void {
    this.adminService.getVehicleTypes().subscribe({
      next: (vehicleTypes) => {
        this.vehicleTypes = vehicleTypes;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar los tipos de vehiculo.';
      },
    });
  }
}
