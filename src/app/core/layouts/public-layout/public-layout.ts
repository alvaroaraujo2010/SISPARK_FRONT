import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  protected readonly mobileNavOpen = signal(false);
  protected readonly currentYear = computed(() => new Date().getFullYear());

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}