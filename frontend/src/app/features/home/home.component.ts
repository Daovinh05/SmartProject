import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Trang chủ placeholder cho Task 2.
 * Task 3/7 sẽ mở rộng để hiện user info + gọi /api/me.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="max-width: 640px; margin: 3rem auto; text-align: center;">
      <h2>SmartProject</h2>
      @if (isLoggedIn) {
        <p>Xin chào, {{ username }}! Bạn đã đăng nhập.</p>
      } @else {
        <p>Bạn chưa đăng nhập.</p>
        <a routerLink="/login">Đi tới Login</a>
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  username?: string;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.username = this.auth.getUsername();
  }
}
