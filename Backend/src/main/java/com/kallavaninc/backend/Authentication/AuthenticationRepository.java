package com.kallavaninc.backend.Authentication;

import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Entities.Users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthenticationRepository extends JpaRepository<User, UUID>{
    // Find a user by email (used for login and duplicate checks)
    Optional<User> findByEmail(String email);

    // Check if an email exists to prevent duplicates
    boolean existsByEmail(String email);

    Optional<Seller> findSellerByUserID(UUID userID);
}
