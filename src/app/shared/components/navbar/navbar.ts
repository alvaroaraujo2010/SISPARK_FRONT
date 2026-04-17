import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly auth = inject(Auth);

  protected readonly session = this.auth.session;
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());

  protected logout(): void {
    this.auth.logout();
  }
}
