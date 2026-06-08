import { Component, input } from '@angular/core';
import { roleLabel } from '../../../core/auth/roles';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly kicker = input<string>('');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly sessionName = input<string | null>(null);
  readonly sessionRole = input<string | null>(null);
  protected readonly roleLabel = roleLabel;
}
