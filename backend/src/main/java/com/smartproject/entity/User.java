package com.smartproject.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Task 6 — Application user, liên kết với Keycloak qua {@code keycloakUserId}.
 *
 * <p>Quy tắc mapping (theo plan.md):
 *
 * <ul>
 *   <li>Dùng Keycloak subject ({@code sub} trong JWT) làm khóa liên kết,
 *       KHÔNG dùng username.</li>
 *   <li>Không trả password/sensitive field — entity này vốn không có password
 *       vì xác thực do Keycloak giữ.</li>
 * </ul>
 */
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** Keycloak subject (claim {@code sub}) — khóa liên kết duy nhất. */
  @Column(name = "keycloak_user_id", nullable = false, unique = true, length = 64)
  private String keycloakUserId;

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

  public User(String keycloakUserId, String username, String fullName, String email, String position) {
    this.keycloakUserId = keycloakUserId;
    this.username = username;
    this.fullName = fullName;
    this.email = email;
    this.position = position;
  }

  public Long getId() {
    return id;
  }

  public String getKeycloakUserId() {
    return keycloakUserId;
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
