package com.kallavaninc.backend.UserFeatures.Administrator;

import com.kallavaninc.backend.UserFeatures.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.PlatformSettings.PlatformSettingsEntity;
import com.kallavaninc.backend.Entities.Users.Administrator;
import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Entities.Users.User;
import com.kallavaninc.backend.GeneralFeatures.PlatformSettings.PlatformSettings;
import com.kallavaninc.backend.GeneralFeatures.PlatformSettings.PlatformSettingsService;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final AuthenticationRepository authenticationRepository;
    private final PlatformSettingsService settingsService;

    public AdministratorService(AdministratorRepository administratorRepository, AuthenticationRepository authenticationRepository, PlatformSettingsService settingsService) {
        this.administratorRepository = administratorRepository;
        this.authenticationRepository = authenticationRepository;
        this.settingsService = settingsService;
    }

    // THE GUARD: Manual check to verify the user role in the database
    public void verifyAdminRole(String email) {
        User user = authenticationRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Access Denied: User not found"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access Denied: Administrator privileges required");
        }
    }

    // verifies Admin action to the Singleton Settings update
    public PlatformSettings configurePlatformSettings(String adminEmail, PlatformSettingsEntity incomingEntity) {
        verifyAdminRole(adminEmail);

        // 1. Update the in-memory Singleton from the incoming Entity
        PlatformSettings.getInstance().updatePlatformSettings(incomingEntity);

        // 2. Persist the state back to the DB
        return settingsService.updateConfiguration();
    }

    // Create New Admin (Restricted to existing Admins)
    public Administrator createAdmin(String adminEmail, Administrator newAdmin) {

        newAdmin.setRole("ADMIN");
        newAdmin.setPassword(DigestUtils.sha256Hex(newAdmin.getPassword()));

        return administratorRepository.save(newAdmin);
    }

    // Get full details for review
    public Seller getSellerForReview(String adminEmail, UUID sellerId) {
        verifyAdminRole(adminEmail);
        return authenticationRepository.findSellerByUserID(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
    }

    public void approveSeller(String adminEmail, UUID sellerId) {
        // 1. Manual Guard check
        verifyAdminRole(adminEmail);

        // 2. Fetch the seller
        Seller seller = authenticationRepository.findSellerByUserID(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        // 3. Update the boolean flag
        seller.setApproved(true);

        // 4. Save the changes
        authenticationRepository.save(seller);
    }

    // Get all sellers (for admin listing)
    public List<Seller> getAllSellers(String adminEmail) {
        verifyAdminRole(adminEmail);
        return authenticationRepository.findAllSellers();
    }

    // Get sellers filtered by approval status
    public List<Seller> getSellersByApprovalStatus(String adminEmail, boolean approved) {
        verifyAdminRole(adminEmail);
        return authenticationRepository.findSellersByApprovalStatus(approved);
    }
}