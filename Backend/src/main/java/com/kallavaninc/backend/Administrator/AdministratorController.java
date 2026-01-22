package com.kallavaninc.backend.Administrator;


import com.kallavaninc.backend.Entities.Payment.Transaction;
import com.kallavaninc.backend.Entities.Users.Administrator;
import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Payment.TransactionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdministratorController {

    private final AdministratorService adminService;
    private final TransactionRepository transactionRepository;

    public AdministratorController(AdministratorService adminService, TransactionRepository transactionRepository) {
        this.adminService = adminService;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> registerNewAdmin(
            @RequestHeader("User-Email") String requesterEmail,
            @RequestBody Administrator newAdmin) {
        try {
            Administrator created = adminService.createAdmin(requesterEmail, newAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // Endpoint to list all sellers (with optional filter for pending approval)
    @GetMapping("/sellers")
    public ResponseEntity<List<Seller>> listAllSellers(
            @RequestHeader("User-Email") String adminEmail,
            @RequestParam(required = false) Boolean approved) {
        if (approved != null) {
            return ResponseEntity.ok(adminService.getSellersByApprovalStatus(adminEmail, approved));
        }
        return ResponseEntity.ok(adminService.getAllSellers(adminEmail));
    }

    // Endpoint to get details + compliance docs
    @GetMapping("/sellers/{sellerId}")
    public ResponseEntity<Seller> viewSellerDetails(
            @RequestHeader("User-Email") String adminEmail,
            @PathVariable UUID sellerId) {
        return ResponseEntity.ok(adminService.getSellerForReview(adminEmail, sellerId));
    }

    // Endpoint to finalize approval
    @PutMapping("/sellers/{sellerId}/approve")
    public ResponseEntity<String> approveSeller(
            @RequestHeader("User-Email") String adminEmail,
            @PathVariable UUID sellerId) {
        adminService.approveSeller(adminEmail, sellerId);
        return ResponseEntity.ok("Seller approved successfully"); // the json file is huge here due to the compliance doc, below is an example on how to view the pdf in React:
        /*
         viewComplianceDoc = (base64String) => {
            // 1. Create a data URL from the base64 string
            // Change 'application/pdf' to 'image/png' if you are storing images
            const linkSource = `data:application/pdf;base64,${base64String}`;

            // 2. Open it in a new window/tab
            const pdfWindow = window.open("");
            pdfWindow.document.write(
                `<iframe width='100%' height='100%' src='${linkSource}'></iframe>`
            );
        };
        */


    }

    // 1. Get User Bank Statement (Matches findAllHistoryForUser)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserHistory(@PathVariable UUID userId) {
        return ResponseEntity.ok(transactionRepository.findAllHistoryForUser(userId));
    }

    // 2. Get Audit Report (Matches findAllByTimestampBetween)
    // Usage: /api/v1/transactions/report?start=2026-01-01T00:00:00&end=2026-01-07T23:59:59
    @GetMapping("/report")
    public ResponseEntity<List<Transaction>> getReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(transactionRepository.findAllByTimestampBetweenOrderByTimestampDesc(start, end));
    }

    // 3. Get Transactions by Status (Matches findByStatus)
    // Usage: /api/v1/transactions/status/SUCCESS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Transaction>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(transactionRepository.findByStatus(status));
    }

    // --- CRUCIAL ADDITION 1: Get Single Transaction Details ---
    // Essential for a "View Receipt" feature in React
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<Transaction> getTransactionDetails(@PathVariable UUID transactionId) {
        return transactionRepository.findById(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}