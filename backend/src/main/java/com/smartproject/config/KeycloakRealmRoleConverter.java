package com.smartproject.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

/**
 * Task 5 — Đọc role realm của Keycloak từ claim {@code realm_access.roles}.
 *
 * <p>Ví dụ JWT:
 *
 * <pre>
 * "realm_access": { "roles": ["ADMIN"] }
 * </pre>
 *
 * <p>được chuyển thành authority {@code ROLE_ADMIN} theo convention Spring Security
 * ({@code hasRole('ADMIN')} sẽ khớp). Các authority mặc định (scope -&gt; {@code SCOPE_*})
 * vẫn được giữ nguyên.
 */
//Class này nhận vào JWT của Keycloak và chuyển các role trong JWT thành Spring Security Authority.
public class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

  //Nó có thể đọc các authority mặc định từ JWT, đặc biệt là scope.
  private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

  @Override
  @SuppressWarnings("unchecked")
  public Collection<GrantedAuthority> convert(Jwt jwt) {
    Collection<GrantedAuthority> authorities = new ArrayList<>(defaultConverter.convert(jwt));

    Map<String, Object> realmAccess = jwt.getClaim("realm_access");
    if (realmAccess == null) {
      return authorities;
    }
    Object roles = realmAccess.get("roles");
    if (!(roles instanceof List<?> roleList)) {
      return authorities;
    }
    for (Object role : roleList) {
      if (role != null) {
        // Chuẩn hóa: ADMIN -> ROLE_ADMIN
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toString().toUpperCase()));
      }
    }
    return authorities;
  }
}
