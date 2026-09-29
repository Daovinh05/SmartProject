package com.smartproject.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Task 6 — Application user, liên kết với Keycloak qua {@code keycloakUsername}.
 *
 * <p>Lưu ý quan trọng (đã inspect token thật ngày 29/09/2026): JWT của realm {@code ssvn}
 * KHÔNG có claim {@code sub}, nên không thể dùng subject làm khóa liên kết như kế hoạch
 * ban đầu. Claim ổn định duy nhất còn lại là {@code preferred_username} — dùng nó thay thế.
 * Nếu sau này realm bổ sung {@code sub} thì migrate sang {@code sub} theo plan.md.
 *
 * <p>Không có password/sensitive field vì xác thực do Keycloak giữ.
 */
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** Keycloak {@code preferred_username} — khóa liên kết duy nhất (thay sub). */
  @Column(name = "keycloak_username", nullable = false, unique = true, length = 100)
  private String keycloakUsername;

  @Column(nullable = false, unique = true, length = 100)
  private String username;

  @Column(name = "full_name", length = 200)
  private String fullName;

  @Column(length = 200)
  private String email;

  /** Chức vụ hiển thị ở Angular (ví dụ: Developer, Manager). */
  @Column(length = 100)
  private String position;

  protected User() {}

  public User(String keycloakUsername, String username, String fullName, String email, String position) {
    this.keycloakUsername = keycloakUsername;
    this.username = username;
    this.fullName = fullName;
    this.email = email;
    this.position = position;
  }

  public Long getId() {
    return id;
  }

  public String getKeycloakUsername() {
    return keycloakUsername;
  }

  public String getUsername() {
    return username;
  }

  public String getFullName() {
    return fullName;
  }

  public String getEmail() {
    return email;
  }

  public String getPosition() {
    return position;
  }
}
