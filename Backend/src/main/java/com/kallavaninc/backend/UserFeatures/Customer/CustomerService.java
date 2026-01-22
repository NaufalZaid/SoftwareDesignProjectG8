package com.kallavaninc.backend.UserFeatures.Customer;

import com.kallavaninc.backend.UserFeatures.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.DTO.CustomerDTO.CustomerProfileDTO;
import com.kallavaninc.backend.Entities.Payment.Transaction;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import com.kallavaninc.backend.Entities.Users.Customer;
import com.kallavaninc.backend.GeneralFeatures.Payment.TransactionRepository;
import com.kallavaninc.backend.GeneralFeatures.Payment.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CustomerService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AuthenticationRepository authenticationRepository;

    public CustomerService(WalletRepository walletRepository, TransactionRepository transactionRepository, AuthenticationRepository authenticationRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.authenticationRepository = authenticationRepository;
    }

    @Transactional
    public void topUpWallet(UUID userId, BigDecimal amount) {
        // Fetch wallet directly
        Wallet wallet = walletRepository.findByUserUserID(userId);

        if (wallet == null) {
            throw new RuntimeException("Wallet not found for user ID: " + userId);
        }

        //Update the balance
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        // Create the Transaction Log
        Transaction log = new Transaction();
        log.setReceiver(wallet.getUser()); // The user receives the money
        log.setSender(null);               // Top-ups have no sender (System-level)
        log.setAmount(amount);
        log.setDescription("Wallet Top-up via Customer Portal");
        log.setStatus("SUCCESS");
        log.setTimestamp(LocalDateTime.now());

        transactionRepository.save(log);
    }

    public CustomerProfileDTO getCustomerProfile(UUID userId) {
        // Fetch the customer or throw an error if not found
        Customer customer = authenticationRepository.findCustomerByUserID(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

        // Map Entity to DTO Excluding password and userID
        return new CustomerProfileDTO(
                customer.getName(),
                customer.getEmail(),
                customer.getShippingAddress(),
                customer.getPhoneNumber(),
                customer.getRole(),
                customer.getCreatedAt()
        );
    }
}
