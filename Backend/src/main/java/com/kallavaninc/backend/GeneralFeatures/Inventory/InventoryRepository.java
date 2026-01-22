package com.kallavaninc.backend.GeneralFeatures.Inventory;

import com.kallavaninc.backend.Entities.Inventory.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    // Useful for SQA: Find products that are running low on stock
    List<Inventory> findByQuantityLessThan(Integer threshold);

    // Find inventory for a specific product
    Optional<Inventory> findByProductId(UUID productId);

    List<Inventory> findByProductSellerUserID(UUID sellerId);
}
