package com.smartproject.controller;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Task 4 — Endpoint test xác thực.
 *
 * <p>GET /api/auth/test với header {@code Authorization: Bearer <access_token>}.
 *
 * <ul>
 *   <li>Không token / token sai -&gt; 401 (do Resource Server).</li>
 *   <li>Token đúng -&gt; 200 kèm principal cơ bản.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthTestController {

  @GetMapping("/test")
  public Map<String, Object> test(Authentication authentication) {
    String username = authentication.getName();
    // Ưu tiên preferred_username trong JWT Keycloak nếu có.
    if (authentication instanceof JwtAuthenticationToken jwtAuth) {
      Object preferred = jwtAuth.getToken().getClaim("preferred_username");
      if (preferred != null) {
        username = preferred.toString();
      }
    }
    return Map.of(
        "authenticated",authentication.isAuthenticated(),
        "username",
        username,
        "authorities",
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
  }
}
