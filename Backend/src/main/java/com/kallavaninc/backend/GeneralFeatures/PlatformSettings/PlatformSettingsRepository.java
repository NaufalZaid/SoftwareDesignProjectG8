package com.kallavaninc.backend.GeneralFeatures.PlatformSettings;

import com.kallavaninc.backend.Entities.PlatformSettings.PlatformSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettingsEntity, Integer> {
}
