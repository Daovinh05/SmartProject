package com.smartproject.controller;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Task 5 — Endpoint kiểm tra phân quyền ADMIN.
 *
 * <p>GET /api/admin/test — chỉ ROLE_ADMIN được qua (2 lớp: URL rule + method rule).
 *
 * <ul>
 *   <li>JWT có ADMIN -&gt; 200.</li>
 *   <li>JWT hợp lệ nhưng không có ADMIN -&gt; 403.</li>
 *   <li>Không token / token sai -&gt; 401.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/admin")
public class AdminTestController {

  @GetMapping("/test")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> test(Authentication authentication) {
    return Map.of(
        "admin", true,
        "username", authentication.getName(),
        "authorities",
            authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
  }
}
