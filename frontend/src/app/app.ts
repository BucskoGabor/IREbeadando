import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastsComponent } from './components/toasts/toasts';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastsComponent],
  template: `
    @if (authService.isLoggedIn()) {
      <app-navbar />
    }
    <main>
      <router-outlet />
    </main>
    <app-toasts />
  `,
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
