/** Đúng shape GET /api/me trả về (xem MeController). */
export interface UserProfile {
  id: number;
  username: string;
  name: string;
  email?: string;
  roles: string[];
  position?: string;
  jobTitle?: string;
}

/** Lỗi đã dịch để UI hiển thị, giữ nguyên status gốc cho component xử lý. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
