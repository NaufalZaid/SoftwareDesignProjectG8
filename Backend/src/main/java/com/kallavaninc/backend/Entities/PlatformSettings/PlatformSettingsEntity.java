package com.kallavaninc.backend.Entities.PlatformSettings;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "platform_settings")
@Getter @Setter
public class PlatformSettingsEntity {

    @Id
    private Integer id = 1;

    private Double taxRate;
    private String currency;

    @ElementCollection
    @CollectionTable(name = "payment_methods", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "method_name")
    private List<String> paymentMethods;

    public PlatformSettingsEntity() {
    }
}
