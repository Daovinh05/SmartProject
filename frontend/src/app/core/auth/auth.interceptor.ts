import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Task 7 — Tự gắn `Authorization: Bearer <access_token>` vào mọi request
 * gọi về Spring Boot (`environment.apiUrl`).
 *
 * - Token lấy tươi từ AuthService (tự refresh trước 30s), không hardcode.
 * - Request ngoài backend (Keycloak, CDN...) giữ nguyên, không gắn token.
 * - Chưa login / không có token thì cho request đi tiếp để backend trả 401.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const auth = inject(AuthService);
  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }),
  );
};
