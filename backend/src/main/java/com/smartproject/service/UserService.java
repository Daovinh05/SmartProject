package com.smartproject.service;

import com.smartproject.entity.User;
import com.smartproject.exception.UserNotFoundException;
import com.smartproject.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Task 6 — Cầu nối JWT -&gt; Database.
 *
 * <p>Flow: JWT (đã verify ở filter) -&gt; lấy {@code preferred_username} -&gt; query bảng
 * {@code users} theo {@code keycloak_username} -&gt; trả entity cho controller.
 *
 * <p>Dùng {@code preferred_username} thay {@code sub} vì token thật của realm {@code ssvn}
 * không có claim {@code sub} (đã inspect ngày 29/09/2026).
 */
@Service
public class UserService {

  private final UserRepository users;

  public UserService(UserRepository users) {
    this.users = users;
  }

  /**
   * Lấy application user của JWT hiện tại.
   *
   * @throws IllegalStateException nếu token thiếu claim {@code preferred_username}
   * @throws UserNotFoundException (404) nếu user chưa có trong DB
   */
  @Transactional(readOnly = true)
  public User getCurrentUser(Jwt jwt) {
    String keycloakUsername = jwt.getClaimAsString("preferred_username");
    if (keycloakUsername == null || keycloakUsername.isBlank()) {
      throw new IllegalStateException(
          "JWT thiếu claim 'preferred_username', kiểm tra Keycloak mapper.");
    }
    return users
        .findByKeycloakUsername(keycloakUsername)
        .orElseThrow(() -> new UserNotFoundException(keycloakUsername));
  }
}
