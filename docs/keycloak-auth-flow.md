# Keycloak Auth Flow — SmartProject

Tài liệu end-to-end của hệ thống Angular + Keycloak + Spring Boot.
Không chứa secret, password hay token thật.

## 1. Architecture

```
┌──────────┐  Click Login   ┌──────────┐  Login UI  ┌──────────┐
│ Angular  │ ─────────────► │ Keycloak │ ◄──────── │  User    │
│ :4200    │ ◄───────────── │ realm    │  code+PKCE │          │
└────┬─────┘  Access Token  │  ssvn    │ ─────────► └──────────┘
     │                      └──────────┘
     │ Bearer Access Token
     ▼
┌──────────┐  verify JWT    ┌──────────┐  SELECT users
│ Spring   │ ─────────────► │  MySQL   │  WHERE keycloak_username = ?
│ Boot     │ ◄───────────── │  :3306   │
│ :8080    │  role/position └──────────┘
└────┬─────┘
     │  /api/me JSON
     ▼
  Angular hiển thị username / roles / position
```

- Keycloak: `https://id.smartsolutionvn.com.vn`, realm `ssvn`,
  client `ssvn-platform-client-id` (public client, không secret).
- Frontend: Angular 19 + `keycloak-js`, chạy `:4200`.
- Backend: Spring Boot 3.3 (Java 21), OAuth2 Resource Server, chạy `:8080`.
- Database: MySQL 8.0 qua `docker-compose.yml`.

## 2. Login flow (Authorization Code + PKCE)

1. User bấm **Login with Keycloak** → `LoginComponent` gọi `AuthService.login()`.
2. `keycloak-js` sinh `code_verifier` (giữ trong browser) + `code_challenge`
   (SHA256) rồi redirect sang Keycloak kèm `code_challenge`.
3. User nhập tài khoản/mật khẩu **trên trang Keycloak** (Angular không thấy).
4. Keycloak redirect về `http://localhost:4200/?code=...&state=...`.
5. Lib gửi `code` + `code_verifier` lên token endpoint; Keycloak đối chiếu
   với `code_challenge` rồi trả `access_token` (+ refresh/id token).
6. `APP_INITIALIZER` + `check-sso` giữ trạng thái đăng nhập khi reload.

Không dùng password grant trong frontend, không nhúng `client_secret`
(curl password grant trong đề mentor chỉ để **test lấy token**, không phải
cách implement).

## 3. Logout flow

1. Bấm Logout → `keycloak.logout({ redirectUri })`.
2. Keycloak xóa SSO session phía server.
3. Redirect về app → `init()` chạy lại → `isLoggedIn() = false`,
   nav hiện Login, route `/` lại yêu cầu đăng nhập.

## 4. JWT — Backend validate thế nào

- `application.yml` khai báo `issuer-uri: .../realms/ssvn`.
- Lần đầu có request, `spring-security-oauth2-jose` GET
  `.../.well-known/openid-configuration`, đọc `jwks_uri`, tải public key
  (JWKS) về cache. Xem thực tế:
  `.../realms/ssvn/protocol/openid-connect/certs` (key `RS256/use:sig`).
- Mỗi request: tìm key theo `kid` trong header → verify chữ ký RSA tại
  local → check `iss` khớp realm + `exp` còn hạn. Rớt bước nào → 401.
- Keycloak xoay key thì Spring tự fetch lại theo `kid` lạ.

## 5. Authentication vs Authorization

- **Authentication** (bạn là ai): token hợp lệ → `JwtAuthenticationToken`.
  Endpoint `GET /api/auth/test` chứng minh.
- **Authorization** (bạn được làm gì): `KeycloakRealmRoleConverter` đọc
  `realm_access.roles` (ví dụ `["ADMIN"]`) thành `ROLE_ADMIN` (giữ nguyên
  `SCOPE_*` mặc định). `GET /api/admin/test` yêu cầu `hasRole('ADMIN')`
  ở cả URL rule và `@PreAuthorize`.

## 6. 401 vs 403 vs 404

| Mã | Nghĩa | Khi nào |
|----|-------|---------|
| 401 | Chưa xác thực được | Thiếu/sai token, token hết hạn, token thiếu claim |
| 403 | Xác thực rồi, thiếu quyền | Token đúng nhưng không có `ROLE_ADMIN` mà gọi `/api/admin/**` |
| 404 | Không có hồ sơ | Token đúng nhưng `preferred_username` chưa có row trong `users` |

## 7. Access Token vs Refresh Token

- **Access Token**: ngắn hạn (realm này ~5 phút), gửi kèm mọi API call.
  Lộ thì thiệt hại giới hạn theo thời gian sống.
- **Refresh Token**: dài hạn, chỉ dùng để đổi access token mới
  (`updateToken(30)` trong `AuthService`/`getToken()` tự làm).
- Không bao giờ hardcode token, không lưu vào `localStorage`,
  không paste token/password thật lên chat hay commit vào git
  (xem `.gitignore`: `.env`, `*.token`, `token*.txt`).

## 8. `/api/me` flow — JWT → DB → Angular

```
Bearer token → filter verify → JwtAuthenticationToken
  → UserService.getCurrentUser(jwt)
  → preferred_username → SELECT users WHERE keycloak_username = ?
  → 200 {id, username, name, email, roles (từ JWT), position (từ DB)}
```

- Khóa liên kết là `preferred_username ↔ keycloak_username` (cột UNIQUE).
  Lý do: **token thật của realm `ssvn` không có claim `sub`** (đã decode
  kiểm chứng nhiều lần), nên không dùng `sub` được. Realm khác có `sub`
  thì migrate theo hướng đó.
- `position`/`email` là dữ liệu nghiệp vụ do app quản (tự INSERT),
  Keycloak chỉ cho identity + role. Sửa `position` của row nào thì user
  đó thấy đổi; mỗi tài khoản Keycloak chỉ map 1 row (UNIQUE).
- Không trả password/sensitive field (entity vốn không có password).

## 9. Trách nhiệm từng thành phần

- **Angular**: UI, nút login/logout, `isLoggedIn()`, interceptor gắn
  `Bearer`, gọi `/api/me`, hiển thị role/position, guard chặn route
  (chỉ là UX — backend mới quyết định quyền cuối cùng).
- **Spring Boot**: Resource Server stateless — verify JWT, mapping role,
  tra DB, trả JSON. Không tạo JWT, không giữ session.
- **Keycloak**: form login, cấp/verify token, giữ role realm.
- **MySQL**: bảng `users` — hồ sơ + position của từng username.

## 10. Local development setup

```bash
# 1. Database
docker compose up -d

# 2. Backend (terminal riêng, chỉ chạy 1 nơi: terminal HOẶC IDE)
cd backend
pkill -f SmartProjectApplication 2>/dev/null
mvn spring-boot:run   # http://localhost:8080

# 3. Frontend (terminal riêng)
cd frontend
npm start -- --port 4200 --cache /tmp/npm-cache   # http://localhost:4200/
```

Seed user demo (sau khi backend tạo bảng xong):

```sql
INSERT INTO users(keycloak_username,username,full_name,email,position)
VALUES ('ssvn','ssvn','SSVN Platform','ssvn@smartsolution.vn','Admin');
```

## 11. Test với browser / Postman / curl

Lấy token test (password grant chỉ dùng test tay, token sống ~5 phút):

```bash
TOKEN=$(curl -s -X POST \
  "https://id.smartsolutionvn.com.vn/realms/ssvn/protocol/openid-connect/token" \
  -d 'grant_type=password' -d 'client_id=ssvn-platform-client-id' \
  -d 'username=USERNAME' -d 'password=PASSWORD' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
```

Ma trận kỳ vọng:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/auth/test
# 401 — không token
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer sai" http://localhost:8080/api/admin/test
# 401 — token bậy
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/admin/test
# 200 + ROLE_ADMIN (token ADMIN) / 403 (token thiếu ADMIN)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/me
# 200 hồ sơ / 404 chưa có row trong DB
```

Browser E2E: mở `:4200` → Login → Keycloak → về `/` hiện đủ
name/role/position → Logout → vào `/` lại bị đá sang Keycloak.
