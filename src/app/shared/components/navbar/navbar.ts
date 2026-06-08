import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import {
  canOperateParking,
  canSupervise,
  defaultAdminRoute,
  isAdministrator,
  isCashier,
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
  protected readonly mobileMenuOpen = signal(false);
  protected readonly roleLabel = roleLabel;

  protected readonly showOperations = computed(() =>
    canOperateParking(this.session()?.role),
  );
  protected readonly showAdminMenu = computed(() => isAdministrator(this.session()?.role));
  protected readonly showCashMenu = computed(() =>
    isAdministrator(this.session()?.role) || isCashier(this.session()?.role),
  );
  protected readonly showReports = computed(() => canSupervise(this.session()?.role));
  protected readonly homeLink = computed(() => defaultAdminRoute(this.session()?.role));

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected logout(): void {
    this.closeMobileMenu();
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
