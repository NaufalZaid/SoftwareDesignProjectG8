package com.kallavaninc.backend.Product;

import com.kallavaninc.backend.Entities.Product.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
