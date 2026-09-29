package com.smartproject.controller;

import com.smartproject.entity.User;
import com.smartproject.service.UserService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Task 6 — Thông tin user hiện tại cho Angular hiển thị role/position.
 *
 * <p>GET /api/me với {@code Authorization: Bearer <access_token>}:
 *
 * <ul>
 *   <li>Không/sai token -&gt; 401 (filter).</li>
 *   <li>Token đúng nhưng chưa có trong DB -&gt; 404 (rõ ràng).</li>
 *   <li>Token đúng + có trong DB -&gt; 200 (chỉ field an toàn).</li>
 * </ul>
 */
@RestController
@RequestMapping("/api")
public class MeController {

  private final UserService userService;

  public MeController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  public Map<String, Object> me(JwtAuthenticationToken authentication) {
    User user = userService.getCurrentUser(authentication.getToken());
    List<String> roles =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring("ROLE_".length()))
            .toList();

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("id", user.getId());
    body.put("username", user.getUsername());
    body.put("name", user.getFullName());
    body.put("email", user.getEmail());
    body.put("roles", roles);
    body.put("position", user.getPosition());
    body.put("jobTitle", user.getJobTitle());
    return body;
  }

  /** Token thiếu sub là token lỗi cấu hình — coi như chưa xác thực được (401). */
  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<Map<String, Object>> handleMissingSubject(IllegalStateException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
  }
}
