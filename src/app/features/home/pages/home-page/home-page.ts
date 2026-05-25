import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { BoardRefresh } from '../../../../core/services/board-refresh';
import type {
  ParkingBoardVehicle,
  DashboardSummary,
  EntryTicket,
  ExitTicket,
  ParkingMovementPreview,
  VisitorVehicleTypeOption,
} from '../../../../core/models/api.types';
import {
  ParkingTicketPrint,
  type ParkingTicketMode,
} from '../../../../shared/components/parking-ticket-print/parking-ticket-print';
import { AdminService } from '../../../../core/services/admin';
import { roleLabel } from '../../../../core/auth/roles';
import { ColombiaDatePipe } from '../../../../core/date/colombia-date.pipe';
import { Auth } from '../../../../core/services/auth';
import { Parking } from '../../../../core/services/parking';
import { ChannelAssistant } from '../../../channel/components/channel-assistant/channel-assistant';

type PrintPrompt = {
  mode: ParkingTicketMode;
  entryTicket?: EntryTicket;
  exitTicket?: ExitTicket;
};

type ReprintDialogState = {
  mode: ParkingTicketMode;
  plate: string;
  entryTicket?: EntryTicket;
  exitTicket?: ExitTicket;
  errorMessage?: string;
};

function formatCop(amount: number): string {
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    CurrencyPipe,
    ColombiaDatePipe,
    ReactiveFormsModule,
    RouterLink,
    ChannelAssistant,
    ParkingTicketPrint,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly fb = inject(FormBuilder);
  private readonly parking = inject(Parking);
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(Auth);
  private readonly boardRefresh = inject(BoardRefresh);

  protected readonly session = this.auth.session;
  protected readonly roleLabel = roleLabel;
  protected readonly reprintingRegistrationId = signal<number | null>(null);

  protected readonly dashboardResource = rxResource<DashboardSummary, number>({
    params: () => this.boardRefresh.tick(),
    stream: () => this.adminService.getDashboardSummary(),
  });

  protected readonly vehiclesResource = rxResource<ParkingBoardVehicle[], number>({
    params: () => this.boardRefresh.tick(),
    stream: () => this.parking.getParkingBoard(),
  });

  protected readonly searchQuery = signal('');

  protected readonly filteredBoardVehicles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const vehicles = this.vehiclesResource.value() ?? [];

    if (!query) {
      return vehicles;
    }

    return vehicles.filter(
      (vehicle) =>
        vehicle.placa.toLowerCase().includes(query) ||
        vehicle.tipoServicio.toLowerCase().includes(query) ||
        vehicle.tipoVehiculo.toLowerCase().includes(query) ||
        vehicle.estado.toLowerCase().includes(query),
    );
  });

  protected readonly plateForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.maxLength(15)]],
  });

  protected readonly isSubmittingMovement = signal(false);
  protected readonly movementError = signal('');
  protected readonly movementMessage = signal('');
  protected readonly printPrompt = signal<PrintPrompt | null>(null);
  protected readonly reprintDialog = signal<ReprintDialogState | null>(null);
  protected readonly movementPreview = signal<ParkingMovementPreview | null>(null);
  protected readonly selectedVehicleTypeId = signal<number | null>(null);
  private readonly ticketPrint = viewChild(ParkingTicketPrint);
  private readonly reprintTicketPrint = viewChild<ParkingTicketPrint>('reprintTicketPrint');

  protected readonly summaryError = computed(() =>
    this.dashboardResource.status() === 'error'
      ? getHttpErrorMessage(
          this.dashboardResource.error(),
          'No fue posible cargar el resumen administrativo.',
        )
      : '',
  );

  protected readonly loadError = computed(() => {
    if (this.vehiclesResource.status() === 'error') {
      return getHttpErrorMessage(
        this.vehiclesResource.error(),
        'No fue posible cargar el listado de vehiculos. Verifique que la API este en ejecucion.',
      );
    }

    return '';
  });

  protected readonly isIngresoPending = computed(() => {
    const preview = this.movementPreview();
    return preview != null && !preview.hasOpenEntry;
  });

  protected readonly canConfirmMovement = computed(() => {
    const preview = this.movementPreview();
    if (!preview) {
      return false;
    }

    if (preview.hasOpenEntry) {
      return true;
    }

    if (preview.requiresVehicleType) {
      return this.selectedVehicleTypeId() != null;
    }

    return true;
  });

  protected readonly pendingActionLabel = computed(() => {
    const preview = this.movementPreview();
    if (!preview) {
      return '';
    }

    if (preview.hasOpenEntry) {
      const estimate =
        preview.estimatedAmountToPay != null
          ? ` · Valor estimado ${formatCop(preview.estimatedAmountToPay)}`
          : '';
      return `Registrar salida de ${preview.plate}${estimate}`;
    }

    return `Registrar ingreso de ${preview.plate}`;
  });

  protected submitPlate(): void {
    if (this.plateForm.invalid) {
      this.plateForm.markAllAsTouched();
      return;
    }

    this.isSubmittingMovement.set(true);
    this.movementError.set('');
    this.movementMessage.set('');
    this.printPrompt.set(null);
    this.movementPreview.set(null);
    this.selectedVehicleTypeId.set(null);

    const { plate } = this.plateForm.getRawValue();
    const normalizedPlate = plate.toUpperCase();

    this.parking.getMovementPreview(normalizedPlate).subscribe({
      next: (preview) => {
        this.isSubmittingMovement.set(false);
        this.movementPreview.set(preview);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingMovement.set(false);
        this.movementError.set(
          getHttpErrorMessage(error, 'No fue posible validar la placa.'),
        );
      },
    });
  }

  protected selectVisitorVehicleType(option: VisitorVehicleTypeOption): void {
    this.selectedVehicleTypeId.set(option.id);
    this.movementError.set('');
  }

  protected confirmMovement(): void {
    const preview = this.movementPreview();
    if (!preview) {
      return;
    }

    if (preview.requiresVehicleType && this.selectedVehicleTypeId() == null) {
      this.movementError.set('Seleccione si el vehiculo es Moto o Carro antes de registrar el ingreso.');
      return;
    }

    this.isSubmittingMovement.set(true);
    this.movementError.set('');
    this.movementMessage.set('');
    this.printPrompt.set(null);

    this.parking.registerEntryExit(preview.plate, this.selectedVehicleTypeId() ?? undefined).subscribe({
      next: (response) => {
        this.isSubmittingMovement.set(false);
        let msg = response.message;
        if (response.action === 'exit' && response.totalToPay != null) {
          msg = `${msg} · Total ${formatCop(response.totalToPay)}`;
        }
        this.movementMessage.set(msg);
        this.plateForm.reset();
        this.movementPreview.set(null);
        this.selectedVehicleTypeId.set(null);
        this.boardRefresh.bump();
        this.vehiclesResource.reload();
        this.dashboardResource.reload();

        if (response.action === 'entry' && response.entryTicket) {
          this.printPrompt.set({ mode: 'entry', entryTicket: response.entryTicket });
        } else if (response.action === 'exit' && response.exitTicket) {
          this.printPrompt.set({ mode: 'exit', exitTicket: response.exitTicket });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingMovement.set(false);
        this.movementError.set(
          getHttpErrorMessage(error, 'No fue posible registrar el movimiento del vehiculo.'),
        );
      },
    });
  }

  protected cancelMovementFlow(): void {
    this.movementPreview.set(null);
    this.selectedVehicleTypeId.set(null);
    this.movementError.set('');
    this.movementMessage.set('');
  }

  protected confirmPrint(): void {
    queueMicrotask(() => {
      this.ticketPrint()?.print();
      globalThis.setTimeout(() => this.dismissPrint(), 300);
    });
  }

  protected dismissPrint(): void {
    this.printPrompt.set(null);
  }

  protected canReprintTicket(vehicle: ParkingBoardVehicle): boolean {
    return vehicle.idRegistro > 0 && (vehicle.estado === 'Activo' || vehicle.estado === 'Salió');
  }

  protected reprintTicket(vehicle: ParkingBoardVehicle): void {
    if (!this.canReprintTicket(vehicle)) {
      return;
    }

    this.reprintingRegistrationId.set(vehicle.idRegistro);
    this.reprintDialog.set(null);

    this.parking.reprintTicket(vehicle.idRegistro).subscribe({
      next: (response) => {
        this.reprintingRegistrationId.set(null);
        if (response.ticketType === 'entry' && response.entryTicket) {
          this.reprintDialog.set({
            mode: 'entry',
            plate: vehicle.placa,
            entryTicket: response.entryTicket,
          });
        } else if (response.ticketType === 'exit' && response.exitTicket) {
          this.reprintDialog.set({
            mode: 'exit',
            plate: vehicle.placa,
            exitTicket: response.exitTicket,
          });
        } else {
          this.reprintDialog.set({
            mode: vehicle.estado === 'Activo' ? 'entry' : 'exit',
            plate: vehicle.placa,
            errorMessage: 'No fue posible generar la tirilla para este registro.',
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.reprintingRegistrationId.set(null);
        this.reprintDialog.set({
          mode: vehicle.estado === 'Activo' ? 'entry' : 'exit',
          plate: vehicle.placa,
          errorMessage: getHttpErrorMessage(error, 'No fue posible reimprimir la tirilla.'),
        });
      },
    });
  }

  protected confirmReprintPrint(): void {
    queueMicrotask(() => {
      this.reprintTicketPrint()?.print();
      globalThis.setTimeout(() => this.dismissReprintDialog(), 300);
    });
  }

  protected dismissReprintDialog(): void {
    this.reprintDialog.set(null);
  }

  protected reprintDialogTitle(): string {
    const dialog = this.reprintDialog();
    if (!dialog) {
      return '';
    }

    const kind = dialog.mode === 'entry' ? 'ingreso' : 'salida';
    return `¿Desea imprimir la tirilla de ${kind} de ${dialog.plate}?`;
  }

  protected updateSearch(query: string): void {
    this.searchQuery.set(query);
  }
}
