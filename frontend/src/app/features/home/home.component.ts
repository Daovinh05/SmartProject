import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError, UserProfile } from '../../core/user/user.model';
import { UserService } from '../../core/user/user.service';

/**
 * Task 7 — Home hiển thị profile từ Backend (GET /api/me).
 * - Chưa login: hiện link Login.
 * - Đã login: gọi /api/me (token do interceptor tự gắn), hiện
 *   username/name, roles, position; lỗi 401/403/404/backend-down đều có
 *   thông báo riêng.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="max-width: 640px; margin: 3rem auto; text-align: center;">
      <h2>SmartProject</h2>
      @if (isLoggedIn) {
        @if (loading) {
          <p>Đang tải thông tin...</p>
        } @else if (profile) {
          <p>Xin chào, {{ profile.name }}!</p>
          <p>Username: {{ profile.username }}</p>
          @if (profile.email) {
            <p>Email: {{ profile.email }}</p>
          }
          <p>Role: {{ profile.roles.join(', ') || '—' }}</p>
          <p>Vị trí: {{ profile.position || '—' }}</p>
        } @else if (profileError) {
          <p style="color: #b91c1c;">{{ profileError }}</p>
          @if (needsLogin) {
            <p><a routerLink="/login">Đăng nhập lại</a></p>
          }
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
  profile: UserProfile | null = null;
  profileError: string | null = null;
  needsLogin = false;
  loading = false;
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private users: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadProfile();
    }
  }

  /** Sau login thành công: gọi /api/me, lưu state để hiển thị. */
  private loadProfile(): void {
    this.loading = true;
    this.profileError = null;
    this.needsLogin = false;
    this.users.getMe().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (err: ApiError) => {
        this.loading = false;
        this.profileError = err.message;
        this.needsLogin = err.status === 401;
      },
    });
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
