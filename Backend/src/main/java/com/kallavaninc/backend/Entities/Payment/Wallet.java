package com.kallavaninc.backend.Entities.Payment;

import com.kallavaninc.backend.Entities.Users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Getter
@Setter
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID walletId;

    @Column(precision = 10, scale = 2)
    private BigDecimal balance = BigDecimal.valueOf(100.00); // Set initial balance

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user; // One wallet per User (Seller or Customer)
}
