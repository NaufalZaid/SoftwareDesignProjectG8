package com.kallavaninc.backend.Seller;

import com.kallavaninc.backend.Customer.CustomerService;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Order.OrderService;
import com.kallavaninc.backend.Payment.WalletRepository;
import com.kallavaninc.backend.Product.ProductService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller")
public class SellerController {

    private final ProductService productService;
    private final OrderService orderService;
    private final WalletRepository walletRepository;
    private final SellerService sellerService;

    public SellerController(ProductService productService, OrderService orderService, WalletRepository walletRepository, SellerService sellerService) {
        this.productService = productService;
        this.orderService = orderService;
        this.walletRepository = walletRepository;
        this.sellerService = sellerService;
    }

    // Endpoint specifically for sellers to add products
    @PostMapping("/{sellerId}/addProduct")
    public ResponseEntity<Product> addProduct(
            @PathVariable UUID sellerId,
            @RequestPart("product") Product product,
            @RequestParam("initialStock") Integer initialStock,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        return ResponseEntity.ok(productService.addProduct(sellerId, product, images, initialStock));
    }

    // UPDATE: Use PUT for modifying existing resources
    @PutMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable UUID sellerId,
            @PathVariable UUID productId,
            @RequestPart("product") Product product,
            @RequestParam("newStock") Integer newStock,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        return ResponseEntity.ok(productService.updateProduct(sellerId, productId, product, newStock, images));
    }

    // DELETE: Use DELETE for removing resources
    @DeleteMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable UUID sellerId,
            @PathVariable UUID productId) throws IOException {

        productService.deleteProduct(sellerId, productId);
        return ResponseEntity.ok("Product deleted successfully");
    }

    // view all orders belonging to a specific Seller's products
    //sellers see what they need to fulfill
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Order>> getOrdersBySeller(@PathVariable UUID sellerId) {
        return ResponseEntity.ok(orderService.getOrdersBySeller(sellerId));
    }

    // Update the Shipment Status
    @PatchMapping("/{orderId}/shipment")
    public ResponseEntity<Order> updateShipment(
            @PathVariable UUID orderId,
            @RequestParam Order.ShipmentStatus status) {
        return ResponseEntity.ok(orderService.updateShipmentStatus(orderId, status));
    }

    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable UUID userId) {
        Wallet wallet = walletRepository.findByUserUserID(userId);

        if (wallet != null) {
            return ResponseEntity.ok(wallet.getBalance());
        }

        // Return 0.00 if seller has no wallet (avoids frontend crashes)
        return ResponseEntity.ok(BigDecimal.ZERO);
    }

    // 2. POST: Withdraw funds from the wallet
    @PostMapping("/wallet/{userId}/withdraw")
    public ResponseEntity<String> withdrawFunds(
            @PathVariable UUID userId,
            @RequestParam BigDecimal amount) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Withdrawal amount must be positive.");
        }

        try {
            sellerService.withdrawFunds(userId, amount);
            return ResponseEntity.ok("Withdrawal successful! Your balance has been updated.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}