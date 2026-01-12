package com.kallavaninc.backend.Payment;

import com.kallavaninc.backend.Entities.Users.User;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    // Find wallet by the User object
    Wallet findByUser(User user);

    Wallet findByUserUserID(UUID userUserID);
}
