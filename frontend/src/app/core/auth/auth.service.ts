import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

/**
 * AuthService — Wrapper duy nhất quanh keycloak-js.
 *
 * Nguyên tắc (theo plan.md Task 1):
 * - Public client, Authorization Code Flow + PKCE (pkceMethod: 'S256').
 * - KHÔNG dùng password grant, KHÔNG có client_secret ở frontend.
 * - Mọi component chỉ gọi qua service này, không new Keycloak() lung tung.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak | undefined;
  private initialized = false;
  private authenticatedFlag = false;

  /**
   * Được gọi 1 lần qua APP_INITIALIZER (xem app.config.ts).
   * - onLoad: 'check-sso': chỉ kiểm tra session, không ép login ngay
   *   (Login UI ở Task 2 sẽ gọi login() khi user click nút).
   * - redirectUri mặc định = window.location.origin (http://localhost:4200/).
   *   Nhớ đăng ký đúng Valid Redirect URI này trong Keycloak client.
   */
  async init(): Promise<boolean> {
    if (this.initialized) {
      return this.authenticatedFlag;
    }
    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
      });
      this.authenticatedFlag = authenticated;
      this.initialized = true;

      // Tự refresh token trước khi hết hạn (30s) để getToken() luôn tươi.
      this.keycloak.onTokenExpired = () => {
        this.keycloak
          ?.updateToken(30)
          .catch(() => this.keycloak?.login());
      };

      return authenticated;
    } catch {
      // Keycloak server down / sai config -> app vẫn boot để hiện lỗi, không crash.
      this.initialized = true;
      this.authenticatedFlag = false;
      return false;
    }
  }

  /** Redirect sang Keycloak realm ssvn để login. */
  login(redirectUri: string = window.location.origin): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak chưa được init. Kiểm tra APP_INITIALIZER.');
    }
    return this.keycloak.login({ redirectUri });
  }

  /** Keycloak logout flow — xóa SSO session phía Keycloak rồi quay về app. */
  logout(redirectUri: string = window.location.origin): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak chưa được init.');
    }
    return this.keycloak.logout({ redirectUri });
  }

  /** Task 3 sẽ dùng để hiển thị Login/Logout + Guard ở Task 8. */
  isLoggedIn(): boolean {
    return this.authenticatedFlag && !!this.keycloak?.authenticated;
  }

  /**
   * Lấy Access Token tươi để gọi Backend (Task 7 dùng trong interceptor).
   * Luôn gọi updateToken(30) trước khi trả token.
   */
  async getToken(): Promise<string | undefined> {
    if (!this.keycloak) {
      return undefined;
    }
    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch {
      return undefined;
    }
  }

  /** Thông tin user cơ bản đã có sẵn trong token (không cần parse JWT tay). */
  getUsername(): string | undefined {
    return this.keycloak?.tokenParsed?.['preferred_username'] as
      | string
      | undefined;
  }

  getUserInfo(): {
    username?: string;
    email?: string;
    name?: string;
    roles?: string[];
  } {
    const parsed = this.keycloak?.tokenParsed as any;
    return {
      username: parsed?.['preferred_username'],
      email: parsed?.['email'],
      name: parsed?.['name'] ?? parsed?.['preferred_username'],
      roles: parsed?.['realm_access']?.['roles'] ?? [],
    };
  }
}
