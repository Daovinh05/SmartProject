import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Task 3 — Home hiển thị authentication state.
 * - Chưa login: hiện link Login.
 * - Đã login: hiện user info cơ bản + nút Logout (Keycloak logout flow).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="max-width: 640px; margin: 3rem auto; text-align: center;">
      <h2>SmartProject</h2>
      @if (isLoggedIn) {
        <p>Xin chào, {{ userInfo.name }}!</p>
        <p>Username: {{ userInfo.username }}</p>
        @if (userInfo.email) {
          <p>Email: {{ userInfo.email }}</p>
        }
        <button
          (click)="onLogout()"
          style="margin-top: 1rem; padding: 0.6rem 1.4rem; border: none; border-radius: 8px; background: #b91c1c; color: #fff; cursor: pointer;"
        >
          Logout
        </button>
        @if (error) {
          <p style="color: #b91c1c;">{{ error }}</p>
        }
      } @else {
        <p>Bạn chưa đăng nhập.</p>
        <a routerLink="/login">Đi tới Login</a>
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  userInfo: {
    username?: string;
    email?: string;
    name?: string;
    roles?: string[];
  } = {};
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.userInfo = this.auth.getUserInfo();
  }

  async onLogout(): Promise<void> {
    this.error = null;
    try {
      await this.auth.logout(window.location.origin + '/');
      this.isLoggedIn = false;
      this.router.navigate(['/']);
    } catch {
      this.error = 'Logout thất bại. Thử lại.';
    }
  }
}
