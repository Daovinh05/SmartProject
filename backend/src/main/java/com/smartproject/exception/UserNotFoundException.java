package com.smartproject.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Task 6 — Keycloak user đã authenticate nhưng chưa có record trong DB thì trả 404
 * với message rõ ràng (không trả stacktrace nhạy cảm).
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {

  public UserNotFoundException(String keycloakUsername) {
    super("Không tìm thấy user ứng với Keycloak username: " + keycloakUsername);
  }
}
