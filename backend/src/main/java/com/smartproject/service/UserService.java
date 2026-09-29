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
 * <p>Flow: JWT (đã verify ở filter) -&gt; lấy {@code sub} -&gt; query bảng {@code users}
 * theo {@code keycloak_user_id} -&gt; trả entity cho controller.
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
   * @throws IllegalStateException nếu token thiếu claim {@code sub}
   * @throws UserNotFoundException (404) nếu user chưa có trong DB
   */
  @Transactional(readOnly = true)
  public User getCurrentUser(Jwt jwt) {
    String subject = jwt.getSubject();
    if (subject == null || subject.isBlank()) {
      // Token thực tế phải có sub; thiếu nghĩa là cấu hình realm/mapper sai.
      throw new IllegalStateException("JWT thiếu claim 'sub', kiểm tra Keycloak mapper.");
    }
    return users.findByKeycloakUserId(subject).orElseThrow(() -> new UserNotFoundException(subject));
  }
}
