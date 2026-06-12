import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../core/services/auth';
import { PaymentsService } from '../../../../core/services/payments';
import { AlertService } from '../../../../core/services/alert';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { KpiCard } from '../../../../shared/components/kpi-card/kpi-card';
import type { CashCloseout, CashShift, Payment, PaymentMethod } from '../../../../core/models/api.types';

@Component({
  selector: 'app-cash-page',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    PageHeader,
    EmptyState,
    KpiCard,
  ],
  templateUrl: './cash-page.html',
  styleUrl: './cash-page.scss',
})
export class CashPage {
  private readonly fb = inject(FormBuilder);
  private readonly paymentsService = inject(PaymentsService);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  protected readonly session = this.auth.session;
  protected readonly selectedDate = signal(new Date().toISOString().slice(0, 10));
  protected readonly searchFrom = signal('');
  protected readonly searchTo = signal('');
  protected readonly saving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly methodsResource = rxResource<PaymentMethod[], undefined>({
    stream: () => this.paymentsService.methods(),
    defaultValue: [] as PaymentMethod[],
  });

  protected readonly closeoutResource = rxResource<CashCloseout, { date: string }>({
    params: () => ({ date: this.selectedDate() }),
    stream: ({ params }) => this.paymentsService.cashCloseout(params.date),
    defaultValue: {
      fecha: '',
      cantidadPagos: 0,
      totalRecaudado: 0,
      ingresosRegistros: 0,
      porMetodo: [],
      porOperador: [],
    } as CashCloseout,
  });

  protected readonly paymentsResource = rxResource<Payment[], { from: string; to: string }>({
    params: () => ({ from: this.searchFrom(), to: this.searchTo() }),
    stream: ({ params }) =>
      this.paymentsService.search(
        params.from || undefined,
        params.to || undefined,
      ),
    defaultValue: [] as Payment[],
  });

  protected readonly totalRecaudado = computed(() => this.closeoutResource.value().totalRecaudado);
  protected readonly totalIngresos = computed(() => this.closeoutResource.value().ingresosRegistros);
  protected readonly totalCantidad = computed(() => this.closeoutResource.value().cantidadPagos);

  protected readonly paymentForm = this.fb.nonNullable.group({
    methodId: [0, [Validators.required, Validators.min(1)]],
    value: [0, [Validators.required, Validators.min(0.01)]],
    reference: [''],
    note: [''],
    registrationId: [null as number | null],
    monthlyId: [null as number | null],
  });

  protected readonly openShiftForm = this.fb.nonNullable.group({
    baseInicial: [0, [Validators.required, Validators.min(0)]],
    observacion: [''],
  });

  protected readonly closeShiftForm = this.fb.nonNullable.group({
    efectivoReal: [0, [Validators.required, Validators.min(0)]],
    observacion: [''],
  });

  protected readonly openShiftResource = rxResource<CashShift | null, number>({
    params: () => 0,
    stream: () => this.paymentsService.openShift(),
    defaultValue: null,
  });

  protected readonly shiftTotalExpected = computed(() => {
    const shift = this.openShiftResource.value();
    return shift ? shift.baseInicial + shift.totalSistema : 0;
  });

  protected readonly loadError = () => {
    if (this.closeoutResource.status() === 'error') {
      return getHttpErrorMessage(this.closeoutResource.error(), 'No fue posible cargar el cierre de caja.');
    }
    if (this.paymentsResource.status() === 'error') {
      return getHttpErrorMessage(this.paymentsResource.error(), 'No fue posible cargar el listado de pagos.');
    }
    if (this.methodsResource.status() === 'error') {
      return getHttpErrorMessage(this.methodsResource.error(), 'No fue posible cargar los metodos de pago.');
    }
    return '';
  };

  protected setDate(value: string): void {
    this.selectedDate.set(value);
  }

  protected setFrom(value: string): void {
    this.searchFrom.set(value);
  }

  protected setTo(value: string): void {
    this.searchTo.set(value);
  }

  protected openShift(): void {
    if (this.openShiftForm.invalid) {
      this.openShiftForm.markAllAsTouched();
      return;
    }

    const value = this.openShiftForm.getRawValue();
    this.saving.set(true);
    this.paymentsService.startShift({
      baseInicial: value.baseInicial,
      observacion: value.observacion.trim() || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.openShiftForm.reset({ baseInicial: 0, observacion: '' });
        this.openShiftResource.reload();
        void this.alert.success('Turno abierto', 'Ya puedes registrar pagos en caja.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        void this.alert.error('Error al abrir turno', getHttpErrorMessage(err, 'No fue posible abrir el turno.'));
      },
    });
  }

  protected closeShift(): void {
    if (this.closeShiftForm.invalid) {
      this.closeShiftForm.markAllAsTouched();
      return;
    }

    const value = this.closeShiftForm.getRawValue();
    this.saving.set(true);
    this.paymentsService.closeShift({
      efectivoReal: value.efectivoReal,
      observacion: value.observacion.trim() || undefined,
    }).subscribe({
      next: (shift) => {
        this.saving.set(false);
        this.closeShiftForm.reset({ efectivoReal: 0, observacion: '' });
        this.openShiftResource.reload();
        this.closeoutResource.reload();
        this.paymentsResource.reload();
        const diff = shift.diferencia ?? 0;
        void this.alert.success('Turno cerrado', `Diferencia: ${diff.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        void this.alert.error('Error al cerrar turno', getHttpErrorMessage(err, 'No fue posible cerrar el turno.'));
      },
    });
  }

  protected submit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    if (!this.openShiftResource.value()) {
      void this.alert.info('Turno requerido', 'Debes abrir un turno de caja antes de registrar pagos.');
      return;
    }
    const value = this.paymentForm.getRawValue();
    if (!value.registrationId && !value.monthlyId) {
      const message = 'Indique el id de registro o de mensualidad asociada al pago.';
      this.error.set(message);
      void this.alert.info('Dato requerido', message);
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.feedback.set('');

    this.paymentsService
      .create({
        methodId: value.methodId,
        value: value.value,
        reference: value.reference.trim() || undefined,
        note: value.note.trim() || undefined,
        registrationId: value.registrationId ?? undefined,
        monthlyId: value.monthlyId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          const message = 'Pago registrado correctamente.';
          this.feedback.set(message);
          void this.alert.success('Pago registrado', message);
          this.paymentForm.reset({ methodId: 0, value: 0, reference: '', note: '', registrationId: null, monthlyId: null });
          this.closeoutResource.reload();
          this.paymentsResource.reload();
          this.openShiftResource.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          const message = getHttpErrorMessage(err, 'No fue posible registrar el pago.');
          this.error.set(message);
          void this.alert.error('Error al registrar pago', message);
        },
      });
  }
}
