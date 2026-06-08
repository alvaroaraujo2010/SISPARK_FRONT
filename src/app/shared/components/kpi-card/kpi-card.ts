import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number | null>();
  readonly hint = input<string>('');
  readonly icon = input<string>('bi-bar-chart');
  readonly tone = input<'green' | 'gold' | 'blue' | 'red' | 'neutral'>('green');
}
