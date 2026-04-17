import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-public-home-page',
  templateUrl: './public-home-page.html',
  styleUrl: './public-home-page.scss',
})
export class PublicHomePage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected goToAdminLogin(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
