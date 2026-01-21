package com.kallavaninc.backend.Inventory;

import com.kallavaninc.backend.Entities.Inventory.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Endpoint for sellers to quickly update stock levels
    @PutMapping("/{sellerId}/stock/{productId}")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable UUID productId,
            @PathVariable UUID sellerId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(inventoryService.updateStock(productId, sellerId, quantity));
    }

    // Endpoint to check availability (useful for the Product Detail page)
    @GetMapping("/{productId}/availability")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable UUID productId,
            @RequestParam Integer requestedQuantity) {

        return ResponseEntity.ok(inventoryService.isInStock(productId, requestedQuantity));
    }

    // Endpoint to get the current stock details for a specific product
    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getStock(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getStockByProductId(productId));
    }

    // Endpoint for a seller to view their entire inventory with product details
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Inventory>> getSellerInventory(@PathVariable UUID sellerId) {
        return ResponseEntity.ok(inventoryService.getAllInventoryBySeller(sellerId));
    }
}
