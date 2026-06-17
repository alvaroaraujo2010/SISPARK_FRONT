import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import {
  canOperateParking,
  canSupervise,
  defaultAdminRouteByAccess,
  hasPermission,
  isAdministrator,
  isCashier,
  PermissionCodes,
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
  protected readonly can = (permission: string) =>
    isAdministrator(this.session()?.role) || hasPermission(this.session()?.permissions, permission);
  protected readonly permissions = PermissionCodes;

  protected readonly showOperations = computed(() =>
    canOperateParking(this.session()?.role)
    || this.can(PermissionCodes.parkingOperate)
    || this.can(PermissionCodes.vehiclesManage)
    || this.can(PermissionCodes.clientsManage)
    || this.can(PermissionCodes.monthliesManage),
  );
  protected readonly showAdminMenu = computed(() =>
    isAdministrator(this.session()?.role)
    || this.can(PermissionCodes.ratesManage)
    || this.can(PermissionCodes.parkingLotManage)
    || this.can(PermissionCodes.usersManage)
    || this.can(PermissionCodes.rolesManage)
    || this.can(PermissionCodes.tenantsManage),
  );
  protected readonly showCashMenu = computed(() =>
    isAdministrator(this.session()?.role) || isCashier(this.session()?.role) || this.can(PermissionCodes.cashManage),
  );
  protected readonly showReports = computed(() =>
    canSupervise(this.session()?.role)
    || this.can(PermissionCodes.reportsView)
    || this.can(PermissionCodes.auditView),
  );
  protected readonly homeLink = computed(() =>
    defaultAdminRouteByAccess(this.session()?.role, this.session()?.permissions),
  );

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
