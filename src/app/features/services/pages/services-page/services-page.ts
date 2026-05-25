import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { AdminService, VehicleType } from '../../../../core/services/admin';
import { Auth } from '../../../../core/services/auth';
import { ChannelWhatsappLinks } from '../../../channel/components/channel-whatsapp-links/channel-whatsapp-links';

@Component({
  selector: 'app-services-page',
  imports: [ReactiveFormsModule, ChannelWhatsappLinks],
  templateUrl: './services-page.html',
  styleUrl: './services-page.scss',
})
export class ServicesPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;

  protected readonly vehicleTypesResource = rxResource<VehicleType[], undefined>({
    defaultValue: [],
    stream: () => this.adminService.getVehicleTypes(),
  });

  protected readonly vehicleTypes = computed(() => this.vehicleTypesResource.value() ?? []);

  protected readonly vehicleTypesLoadError = computed(() =>
    this.vehicleTypesResource.status() === 'error'
      ? getHttpErrorMessage(
          this.vehicleTypesResource.error(),
          'No fue posible cargar los tipos de vehiculo.',
        )
      : '',
  );

  protected readonly vehicleForm = this.fb.nonNullable.group({
    identificationType: ['', Validators.required],
    identificationNumber: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: [''],
    plate: ['', [Validators.required, Validators.maxLength(15)]],
    brand: ['', Validators.required],
    vehicleModel: ['', Validators.required],
    color: [''],
    vehicleTypeId: [0, Validators.min(1)],
    paymentType: ['', Validators.required],
    comments: [''],
  });

  protected isSubmitting = false;
  protected successMessage = '';
  protected errorMessage = '';

  protected submitRegistration(): void {
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
      next: (result) => {
        this.isSubmitting = false;
        this.successMessage = result.message || 'Cliente y vehiculo registrados correctamente.';
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
        this.errorMessage = getHttpErrorMessage(
          error,
          'No fue posible guardar el registro del cliente y del vehiculo.',
        );
      },
    });
  }

  protected retryVehicleTypes(): void {
    this.vehicleTypesResource.reload();
  }
}
