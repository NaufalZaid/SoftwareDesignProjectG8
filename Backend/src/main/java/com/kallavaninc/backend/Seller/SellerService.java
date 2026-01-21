package com.kallavaninc.backend.Seller;

import com.kallavaninc.backend.Entities.Payment.Transaction;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import com.kallavaninc.backend.Payment.TransactionRepository;
import com.kallavaninc.backend.Payment.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Seller.SellerRepository;

@Service


public class SellerService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final SellerRepository sellerRepository;

    public SellerService(WalletRepository walletRepository, TransactionRepository transactionRepository, SellerRepository sellerRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.sellerRepository = sellerRepository;
    }

    public SellerProfileDto getSellerProfile(UUID userId) {
        Seller seller = sellerRepository
                .findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        String status = seller.isApproved() ? "APPROVED" : "PENDING";

        return new SellerProfileDto(
                seller.getUserID(),
                seller.getEmail(),
                seller.getStoreName(),
                status,
                seller.getCreatedAt()
        );
    }

    @Transactional
    public void withdrawFunds(UUID userId, BigDecimal amount) {
        // 1. Fetch the seller's wallet directly
        Wallet wallet = walletRepository.findByUserUserID(userId);
        if (wallet == null) {
            throw new RuntimeException("Wallet not found for seller ID: " + userId);
        }

        // 2. Validation: Ensure seller isn't trying to withdraw more than they have
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds for withdrawal. Current balance: " + wallet.getBalance());
        }

        // 3. Deduct from balance
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // 4. Create Transaction Log for SQA Audit
        Transaction log = new Transaction();
        log.setSender(wallet.getUser());   // The seller is "sending" money out of the system
        log.setReceiver(null);             // External withdrawal is represented by a null receiver
        log.setAmount(amount);
        log.setDescription("Seller Wallet Withdrawal");
        log.setStatus("SUCCESS");
        log.setTimestamp(LocalDateTime.now());

        transactionRepository.save(log);
    }
}
