import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isLoggedIn = false;
  username?: string;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.refreshState();
  }

  /** Đọc state duy nhất từ AuthService (vốn đọc từ keycloak-js). */
  private refreshState(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.username = this.auth.getUsername();
  }

  async onLogout(): Promise<void> {
    // Keycloak logout flow: xóa SSO session phía Keycloak rồi quay về '/'.
    await this.auth.logout(window.location.origin + '/');
    this.refreshState();
    this.router.navigate(['/']);
  }
}
