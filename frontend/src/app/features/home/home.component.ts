import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError, UserProfile } from '../../core/user/user.model';
import { UserService } from '../../core/user/user.service';

/**
 * Trang chủ SmartProject.
 * - Khách: hero giới thiệu + CTA đăng nhập (h1/p chuẩn SEO).
 * - Đã login: thẻ hồ sơ từ GET /api/me (username, roles, position).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
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
      await this.auth.logout(window.location.origin + '/login');
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    } catch {
      this.error = 'Đăng xuất thất bại. Thử lại.';
    }
  }
}
