package com.kallavaninc.backend.GeneralFeatures.Inventory;

import com.kallavaninc.backend.Entities.Inventory.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional
    public Inventory updateStock(UUID productId, UUID sellerId, Integer newQuantity) {
        // 1. Fetch the Inventory by Product ID
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory record not found for this product"));


        // 2. Manual Ownership Check: Compare IDs
        // We check if the seller_id stored in the inventory matches the parameter sellerId
        if (!inventory.getSeller().getUserID().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: This product does not belong to the provided seller.");
        }

        // 3. Perform the update if the check passes
        inventory.setQuantity(newQuantity);

        return inventoryRepository.save(inventory);
    }

    // Business Logic: Check if an item is in stock before allowing a purchase
    public boolean isInStock(UUID productId, Integer requestedQuantity) {
        return inventoryRepository.findByProductId(productId)
                .map(inv -> inv.getQuantity() >= requestedQuantity)
                .orElse(false);
    }

    @Transactional
    public void deductStock(UUID productId, Integer quantityToDeduct) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        if (inventory.getQuantity() < quantityToDeduct) {
            throw new RuntimeException("Inventory changed during transaction. Not enough stock.");
        }

        inventory.setQuantity(inventory.getQuantity() - quantityToDeduct);
        inventoryRepository.save(inventory);
    }

    public Inventory getStockByProductId(UUID productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory record not found for Product ID: " + productId));
    }

    @Transactional(readOnly = true) // Required for Lazy loading product details
    public List<Inventory> getAllInventoryBySeller(UUID sellerId) {
        // This calls the repository method we defined earlier
        return inventoryRepository.findByProductSellerUserID(sellerId);
    }
}
