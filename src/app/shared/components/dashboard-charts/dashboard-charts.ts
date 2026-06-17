import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../../core/services/admin';
import type { DashboardChartData } from '../../../core/models/api.types';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  imports: [],
  templateUrl: './dashboard-charts.html',
  styleUrl: './dashboard-charts.scss',
})
export class DashboardCharts {
  private readonly adminService = inject(AdminService);

  protected readonly lineCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lineCanvas');
  protected readonly doughnutCanvas = viewChild<ElementRef<HTMLCanvasElement>>('doughnutCanvas');
  protected readonly barCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barCanvas');

  private lineChart: Chart<'line'> | null = null;
  private doughnutChart: Chart<'doughnut'> | null = null;
  private barChart: Chart<'bar'> | null = null;

  protected readonly chartsResource = rxResource<DashboardChartData, undefined>({
    stream: () => this.adminService.getDashboardChartData(),
    defaultValue: {
      last7DaysRevenue: [],
      revenueByServiceType: [],
      activeVehicleTypeDistribution: [],
    },
  });

  constructor() {
    effect(() => {
      const data = this.chartsResource.value();
      if (data.last7DaysRevenue.length > 0) {
        this.renderCharts(data);
      }
    });
  }

  private renderCharts(data: DashboardChartData): void {
    const labels = data.last7DaysRevenue.map(item => {
      const parts = item.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    const revenue = data.last7DaysRevenue.map(item => item.revenue);

    // Line chart - last 7 days revenue
    const lineEl = this.lineCanvas()?.nativeElement;
    if (lineEl) {
      this.lineChart?.destroy();
      this.lineChart = new Chart(lineEl, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Ingresos del día',
            data: revenue,
            borderColor: '#5cb85c',
            backgroundColor: 'rgba(92, 184, 92, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#5cb85c',
            pointBorderColor: '#1e1e2e',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#a0a0b0',
                callback: (value) => '$' + Number(value).toLocaleString('es-CO'),
              },
              grid: { color: 'rgba(255,255,255,0.05)' },
            },
            x: {
              ticks: { color: '#a0a0b0' },
              grid: { display: false },
            },
          },
        },
      });
    }

    // Doughnut chart - revenue by service type
    const doughnutEl = this.doughnutCanvas()?.nativeElement;
    if (doughnutEl) {
      const colors = ['#5cb85c', '#f0ad4e', '#5bc0de', '#d9534f', '#8e44ad'];
      this.doughnutChart?.destroy();
      this.doughnutChart = new Chart(doughnutEl, {
        type: 'doughnut',
        data: {
          labels: data.revenueByServiceType.map(item => item.serviceType),
          datasets: [{
            data: data.revenueByServiceType.map(item => item.total),
            backgroundColor: data.revenueByServiceType.map((_, i) => colors[i % colors.length]),
            borderColor: '#1e1e2e',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#c0c0d0', padding: 16 },
            },
          },
        },
      });
    }

    // Bar chart - active vehicle types
    const barEl = this.barCanvas()?.nativeElement;
    if (barEl) {
      const barColors = ['#5cb85c', '#f0ad4e', '#5bc0de', '#d9534f'];
      this.barChart?.destroy();
      this.barChart = new Chart(barEl, {
        type: 'bar',
        data: {
          labels: data.activeVehicleTypeDistribution.map(item => item.vehicleType),
          datasets: [{
            label: 'Activos',
            data: data.activeVehicleTypeDistribution.map(item => item.count),
            backgroundColor: data.activeVehicleTypeDistribution.map((_, i) => barColors[i % barColors.length]),
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#a0a0b0',
                stepSize: 1,
              },
              grid: { color: 'rgba(255,255,255,0.05)' },
            },
            x: {
              ticks: { color: '#a0a0b0' },
              grid: { display: false },
            },
          },
        },
      });
    }
  }
}
