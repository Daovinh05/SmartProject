import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiError, UserProfile } from './user.model';

/**
 * Task 7 — Gọi Backend. Token do authInterceptor tự gắn,
 * service này chỉ lo URL + dịch lỗi:
 * - 401: chưa login / token hết hạn → về trang login.
 * - 403: đã login nhưng thiếu quyền.
 * - 404: user Keycloak chưa có record trong DB.
 * - 0: backend tắt / không tới được.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly meUrl = `${environment.apiUrl}/api/me`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.meUrl).pipe(catchError(mapError));
  }
}

function mapError(err: HttpErrorResponse): Observable<never> {
  if (err.status === 0) {
    return throwError(() => new ApiError(0, 'Không kết nối được Backend (http://localhost:8080).'));
  }
  const messages: Record<number, string> = {
    401: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền truy cập.',
    404: 'Tài khoản Keycloak chưa có thông tin trong hệ thống. Liên hệ quản trị viên.',
  };
  return throwError(
    () => new ApiError(err.status, messages[err.status] ?? `Lỗi ${err.status} từ Backend.`),
  );
}
