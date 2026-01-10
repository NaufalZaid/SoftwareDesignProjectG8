package com.kallavaninc.backend.PlatformSettings;

import com.kallavaninc.backend.Administrator.AdministratorService;
import com.kallavaninc.backend.Entities.PlatformSettings.PlatformSettingsEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/settings")
public class PlatformSettingsController {

    private final AdministratorService adminService; // Injected to handle the authorized "Action"

    public PlatformSettingsController(AdministratorService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public PlatformSettings getCurrentSettings() {
        return PlatformSettings.getInstance();
    }

    // Ask the AdminService to verify the email and update
    @PutMapping("/update")
    public PlatformSettings updatePlatformConfig(
            @RequestHeader("User-Email") String adminEmail,
            @RequestBody PlatformSettingsEntity newSettings) {

        // pass the request to the AdminService for verification
        return adminService.configurePlatformSettings(adminEmail, newSettings);
    }
}
