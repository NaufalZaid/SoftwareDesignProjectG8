package com.kallavaninc.backend.Authentication;

import com.kallavaninc.backend.Entities.Users.Customer;
import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Entities.Users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthenticationRepository extends JpaRepository<User, UUID>{
    // Find a user by email (used for login and duplicate checks)
    Optional<User> findByEmail(String email);

    // Check if an email exists to prevent duplicates
    boolean existsByEmail(String email);

    Optional<Seller> findSellerByUserID(UUID userID);

    Optional<Customer> findCustomerByUserID(UUID userID);

    // Find all sellers
    @Query("SELECT s FROM Seller s")
    List<Seller> findAllSellers();

    // Find sellers by approval status
    @Query("SELECT s FROM Seller s WHERE s.isApproved = :approved")
    List<Seller> findSellersByApprovalStatus(@Param("approved") boolean approved);
}
