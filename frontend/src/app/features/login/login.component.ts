import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Task 2 — Login page.
 * - Chỉ có 1 nút "Login with Keycloak", KHÔNG có form username/password.
 * - Nếu đã authenticated thì tự chuyển về '/' (không hiện login nữa).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  async onLogin(): Promise<void> {
    this.error = null;
    try {
      // Redirect sang Keycloak realm ssvn (Authorization Code + PKCE).
      await this.auth.login();
    } catch {
      this.error = 'Không thể chuyển sang Keycloak. Kiểm tra cấu hình client.';
    }
  }
}
