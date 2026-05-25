import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import {
  canOperateParking,
  canSupervise,
  defaultAdminRoute,
  isAdministrator,
  roleLabel,
} from '../../../core/auth/roles';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly session = this.auth.session;
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  protected readonly roleLabel = roleLabel;

  protected readonly showOperations = computed(() =>
    canOperateParking(this.session()?.role),
  );
  protected readonly showAdminMenu = computed(() => isAdministrator(this.session()?.role));
  protected readonly showReports = computed(() => canSupervise(this.session()?.role));
  protected readonly homeLink = computed(() => defaultAdminRoute(this.session()?.role));

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
