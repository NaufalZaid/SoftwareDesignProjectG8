package com.kallavaninc.backend.Seller;

import com.kallavaninc.backend.Entities.Users.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SellerRepository extends JpaRepository<Seller, UUID> {
    Optional<Seller> findByUserID(UUID userID);

}
