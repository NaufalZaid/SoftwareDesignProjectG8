package com.kallavaninc.backend.Product;

import com.kallavaninc.backend.Entities.Product.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Public view of a specific seller's store
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Product>> getBySeller(@PathVariable UUID sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterByCategory(@RequestParam String category) {
        List<Product> filteredProducts = productService.getProductsByCategory(category);
        return ResponseEntity.ok(filteredProducts);
    }

    @PatchMapping("/{sellerId}/status/{productId}")
    public ResponseEntity<Product> updateStatus(
            @PathVariable UUID sellerId,
            @PathVariable UUID productId,
            @RequestParam Product.ProductStatus status) {

        return ResponseEntity.ok(productService.updateProductStatus(sellerId, productId, status));
    }
}
