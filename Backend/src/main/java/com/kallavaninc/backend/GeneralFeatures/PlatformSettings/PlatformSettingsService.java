package com.kallavaninc.backend.GeneralFeatures.PlatformSettings;

import com.kallavaninc.backend.Entities.PlatformSettings.PlatformSettingsEntity;
import org.springframework.stereotype.Service;

@Service
public class PlatformSettingsService {

    private final PlatformSettingsRepository repository;

    public PlatformSettingsService(PlatformSettingsRepository repository) {
        this.repository = repository;

        PlatformSettingsEntity entity = repository
                .findById(1)
                .orElseGet(() ->
                {
                    PlatformSettingsEntity defaults = new PlatformSettingsEntity();
                    defaults.setId(PlatformSettings.getInstance().getId());
                    defaults.setTaxRate(PlatformSettings.getInstance().getTaxRate());
                    defaults.setCurrency(PlatformSettings.getInstance().getCurrency());
                    return repository.save(defaults);
                });

        // ensure singleton matches the db
        PlatformSettings.getInstance().updatePlatformSettings(entity);
    }


    public PlatformSettings updateConfiguration() {
        // 1. Fetch the existing entity to maintain the database session
        PlatformSettingsEntity entity = repository.findById(1)
                .orElse(new PlatformSettingsEntity()); // Create if somehow missing

        // 2. Map basic fields
        entity.setId(1);
        entity.setTaxRate(PlatformSettings.getInstance().getTaxRate());
        entity.setCurrency(PlatformSettings.getInstance().getCurrency());

        // 3. Synchronize the List safely
        // Clear and addAll is the standard SQA practice for @ElementCollection
        entity.getPaymentMethods().clear();
        if (PlatformSettings.getInstance().getPaymentMethods() != null) {
            entity.getPaymentMethods().addAll(PlatformSettings.getInstance().getPaymentMethods());
        }

        repository.save(entity);
        return PlatformSettings.getInstance();
    }
}
