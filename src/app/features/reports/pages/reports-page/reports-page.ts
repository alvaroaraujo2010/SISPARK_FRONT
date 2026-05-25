import { Component, inject } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { roleLabel } from '../../../../core/auth/roles';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
})
export class ReportsPage {
  protected readonly session = inject(Auth).session;
  protected readonly roleLabel = roleLabel;
}
