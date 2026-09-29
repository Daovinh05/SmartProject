import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../core/user/user.model';
import { UserService } from '../../core/user/user.service';

/** Header dùng chung: brand + nav + tên hiển thị lấy từ /api/me (DB). */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  username?: string;
  profile: UserProfile | null = null;

  constructor(
    private auth: AuthService,
    private users: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.username = this.auth.getUsername();
    // Tên ở header lấy từ DB (đổi trong DB là đổi theo),
    // rớt mạng/backend lỗi thì fallback tên trong token.
    if (this.isLoggedIn) {
      this.users.getMe().subscribe({
        next: (profile) => (this.profile = profile),
        error: () => (this.profile = null),
      });
    }
  }

  async onLogout(): Promise<void> {
    // Keycloak logout flow: xóa SSO session rồi về thẳng trang login của FE.
    await this.auth.logout(window.location.origin + '/login');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
