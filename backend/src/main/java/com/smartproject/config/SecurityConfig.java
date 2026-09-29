package com.smartproject.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Task 4 — Backend là OAuth2 Resource Server thuần túy.
 *
 * <ul>
 *   <li>Không tự viết JwtProvider, không tạo JWT mới.</li>
 *   <li>Không dùng password grant, không cần client_secret.</li>
 *   <li>JWT được validate bằng issuer-uri (xem application.yml).</li>
 *   <li>Task 5 — mapping role: realm_access.roles (ADMIN) thành ROLE_ADMIN,
 *       giữ nguyên authority mặc định (SCOPE_*).</li>
 * </ul>
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/api/auth/test")
                        .authenticated()
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")
                        .anyRequest()
                        .authenticated())
        .oauth2ResourceServer(
            oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))); //"Backend này là OAuth2 Resource Server và access token được gửi dưới dạng JWT."
            //"Ứng dụng này là OAuth2 Resource Server và nó nhận JWT Bearer Token để xác thực request."
    return http.build();
  }

  /**
   * Đọc principal từ claim preferred_username, authority từ converter Task 5
   * (SCOPE_* mặc định + ROLE_* từ realm_access).
   */
  @Bean
  JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleConverter());
    converter.setPrincipalClaimName("preferred_username");
    return converter;
  }

  /** Cho phép Angular localhost:4200 gọi API kèm Authorization header. */
  @Bean
  CorsConfigurationSource corsConfigurationSource(
      @Value("${app.cors.allowed-origins:http://localhost:4200}") String allowedOrigins) {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(false);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
  }
}
