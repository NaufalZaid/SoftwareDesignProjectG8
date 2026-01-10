package com.kallavaninc.backend.Administrator;


import com.kallavaninc.backend.Entities.Users.Administrator;
import com.kallavaninc.backend.Entities.Users.Seller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdministratorController {

    private final AdministratorService adminService;

    public AdministratorController(AdministratorService adminService) {
        this.adminService = adminService;
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
}