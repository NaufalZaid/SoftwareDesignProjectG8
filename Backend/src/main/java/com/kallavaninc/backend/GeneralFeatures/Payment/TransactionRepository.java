package com.kallavaninc.backend.GeneralFeatures.Payment;

import com.kallavaninc.backend.Entities.Payment.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // 1. All transactions involving this user
    @Query("SELECT t FROM Transaction t WHERE t.sender.userID = :userId OR t.receiver.userID = :userId ORDER BY t.timestamp DESC")
    List<Transaction> findAllHistoryForUser(@Param("userId") UUID userId);

    // 2. All transactions in a date range (e.g., "This Week")
    List<Transaction> findAllByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    // 3.  Find all transactions by status
    List<Transaction> findByStatus(String status);
}
