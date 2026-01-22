package com.kallavaninc.backend.GeneralFeatures.PlatformSettings;


import com.kallavaninc.backend.Entities.PlatformSettings.PlatformSettingsEntity;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
public class PlatformSettings {

    private Integer id = 1;
    private Double taxRate;
    private String currency;
    private List<String> paymentMethods = new ArrayList<>();

    // 1. Static variable for the single instance
    private static PlatformSettings instance;

    // 2. STRICT PRIVATE constructor
    private PlatformSettings() {
        this.id = 1;
        this.taxRate = 0.05;
        this.currency = "MYR";
    }

    // 3. Static access method
    public static synchronized PlatformSettings getInstance() {
        if (instance == null) {
            instance = new PlatformSettings();
        }
        return instance;
    }

    public void updatePlatformSettings(PlatformSettingsEntity entity) {
        setTaxRate(entity.getTaxRate());
        setCurrency(entity.getCurrency());
        setPaymentMethods(entity.getPaymentMethods());
    }
}