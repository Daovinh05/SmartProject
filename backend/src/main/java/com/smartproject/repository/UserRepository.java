package com.smartproject.repository;

import com.smartproject.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

  /** Tìm user nội bộ bằng Keycloak subject. */
  Optional<User> findByKeycloakUserId(String keycloakUserId);
}
