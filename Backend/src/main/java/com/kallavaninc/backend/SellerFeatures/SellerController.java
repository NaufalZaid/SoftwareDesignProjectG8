package com.kallavaninc.backend.SellerFeatures;

import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Order.OrderService;
import com.kallavaninc.backend.Product.ProductService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller")
public class SellerController {

    private final ProductService productService;
    private final OrderService orderService;

    public SellerController(ProductService productService, OrderService orderService) {
        this.productService = productService;
        this.orderService = orderService;
    }

    // Endpoint specifically for sellers to add products
    @PostMapping("/{sellerId}/addProduct")
    public ResponseEntity<Product> addProduct(
            @PathVariable UUID sellerId,
            @RequestPart("product") Product product,
            @RequestPart("images") List<MultipartFile> images) throws IOException {

        return ResponseEntity.ok(productService.addProduct(sellerId, product, images));
    }

    // UPDATE: Use PUT for modifying existing resources
    @PutMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable UUID sellerId,
            @PathVariable UUID productId,
            @RequestPart("product") Product product,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        return ResponseEntity.ok(productService.updateProduct(sellerId, productId, product, images));
    }

    // DELETE: Use DELETE for removing resources
    @DeleteMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable UUID sellerId,
            @PathVariable UUID productId) {

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
}