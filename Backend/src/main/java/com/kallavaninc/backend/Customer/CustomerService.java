package com.kallavaninc.backend.Customer;

import com.kallavaninc.backend.Entities.Payment.Transaction;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import com.kallavaninc.backend.Payment.TransactionRepository;
import com.kallavaninc.backend.Payment.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CustomerService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public CustomerService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void topUpWallet(UUID userId, BigDecimal amount) {
        // 1. Fetch wallet directly (No Optional)
        Wallet wallet = walletRepository.findByUserUserID(userId);

        if (wallet == null) {
            throw new RuntimeException("Wallet not found for user ID: " + userId);
        }

        // 2. Update the balance
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        // 3. Create the Transaction Log for SQA Traceability
        Transaction log = new Transaction();
        log.setReceiver(wallet.getUser()); // The user receives the money
        log.setSender(null);               // Top-ups have no sender (System-level)
        log.setAmount(amount);
        log.setDescription("Wallet Top-up via Customer Portal");
        log.setStatus("SUCCESS");
        log.setTimestamp(LocalDateTime.now());

        transactionRepository.save(log);
    }
}
