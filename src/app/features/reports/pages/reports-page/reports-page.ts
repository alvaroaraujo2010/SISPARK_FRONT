import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../core/services/auth';
import { ReportsService } from '../../../../core/services/reports';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { KpiCard } from '../../../../shared/components/kpi-card/kpi-card';
import type {
  DueSoonReport,
  IncomeReport,
  OccupancyReport,
  OperatorPerformanceReport,
} from '../../../../core/models/api.types';

@Component({
  selector: 'app-reports-page',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    PageHeader,
    EmptyState,
    KpiCard,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
})
export class ReportsPage {
  private readonly fb = inject(FormBuilder);
  private readonly reportsService = inject(ReportsService);
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;
  protected readonly from = signal(this.daysAgoIso(30));
  protected readonly to = signal(new Date().toISOString().slice(0, 10));

  private static readonly emptyIncome: IncomeReport = {
    from: '',
    to: '',
    ingresosCobros: 0,
    ingresosPagos: 0,
    ingresosMensualidades: 0,
    serie: [],
  };

  private static readonly emptyOccupancy: OccupancyReport = {
    from: '',
    to: '',
    capacidadTotal: 0,
    ocupacionPromedio: 0,
    totalEntradas: 0,
    totalSalidas: 0,
    serie: [],
  };

  private static readonly emptyOperators: OperatorPerformanceReport = {
    from: '',
    to: '',
    operadores: [],
  };

  private static readonly emptyDueSoon: DueSoonReport = {
    from: '',
    to: '',
    items: [],
  };

  protected readonly incomeResource = rxResource<IncomeReport, { from: string; to: string }>({
    params: () => ({ from: this.from(), to: this.to() }),
    stream: ({ params }) => this.reportsService.income(params.from, params.to),
    defaultValue: ReportsPage.emptyIncome,
  });

  protected readonly occupancyResource = rxResource<OccupancyReport, { from: string; to: string }>({
    params: () => ({ from: this.from(), to: this.to() }),
    stream: ({ params }) => this.reportsService.occupancy(params.from, params.to),
    defaultValue: ReportsPage.emptyOccupancy,
  });

  protected readonly operatorsResource = rxResource<OperatorPerformanceReport, { from: string; to: string }>({
    params: () => ({ from: this.from(), to: this.to() }),
    stream: ({ params }) => this.reportsService.operators(params.from, params.to),
    defaultValue: ReportsPage.emptyOperators,
  });

  protected readonly monthliesDueResource = rxResource<DueSoonReport, undefined>({
    stream: () => this.reportsService.monthliesDue(14),
    defaultValue: ReportsPage.emptyDueSoon,
  });

  protected readonly loadError = () => {
    if (this.incomeResource.status() === 'error') {
      return getHttpErrorMessage(this.incomeResource.error(), 'No fue posible cargar el reporte de ingresos.');
    }
    if (this.occupancyResource.status() === 'error') {
      return getHttpErrorMessage(this.occupancyResource.error(), 'No fue posible cargar el reporte de ocupacion.');
    }
    if (this.operatorsResource.status() === 'error') {
      return getHttpErrorMessage(this.operatorsResource.error(), 'No fue posible cargar el rendimiento de operadores.');
    }
    if (this.monthliesDueResource.status() === 'error') {
      return getHttpErrorMessage(this.monthliesDueResource.error(), 'No fue posible cargar las mensualidades por vencer.');
    }
    return '';
  };

  protected setFrom(value: string): void {
    this.from.set(value);
  }

  protected setTo(value: string): void {
    this.to.set(value);
  }

  private daysAgoIso(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }
}
