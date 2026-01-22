package com.kallavaninc.backend.GeneralFeatures.Category;

import com.kallavaninc.backend.UserFeatures.Administrator.AdministratorService;
import com.kallavaninc.backend.Entities.Category.Category;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CategoryController {

    private final CategoryService categoryService;
    private final AdministratorService administratorService;

    public CategoryController(CategoryService categoryService, AdministratorService administratorService) {
        this.categoryService = categoryService;
        this.administratorService = administratorService;
    }

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Get all categories (flat list) - for seller dropdown suggestions
     * GET /api/v1/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * Get categories as hierarchical tree
     * GET /api/v1/categories/tree
     */
    @GetMapping("/categories/tree")
    public ResponseEntity<List<Map<String, Object>>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all categories (admin view)
     * GET /api/v1/admin/categories
     */
    @GetMapping("/admin/categories")
    public ResponseEntity<List<Category>> getAdminCategories(
            @RequestHeader("User-Email") String adminEmail) {
        administratorService.verifyAdminRole(adminEmail);
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * Get single category by ID
     * GET /api/v1/admin/categories/{id}
     */
    @GetMapping("/admin/categories/{id}")
    public ResponseEntity<Category> getCategoryById(
            @RequestHeader("User-Email") String adminEmail,
            @PathVariable UUID id) {
        administratorService.verifyAdminRole(adminEmail);
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    /**
     * Create a new category
     * POST /api/v1/admin/categories
     */
    @PostMapping("/admin/categories")
    public ResponseEntity<?> createCategory(
            @RequestHeader("User-Email") String adminEmail,
            @RequestBody Category category) {
        try {
            administratorService.verifyAdminRole(adminEmail);
            Category created = categoryService.createCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update an existing category
     * PUT /api/v1/admin/categories/{id}
     */
    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader("User-Email") String adminEmail,
            @PathVariable UUID id,
            @RequestBody Category category) {
        try {
            administratorService.verifyAdminRole(adminEmail);
            Category updated = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete a category
     * DELETE /api/v1/admin/categories/{id}
     */
    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader("User-Email") String adminEmail,
            @PathVariable UUID id) {
        try {
            administratorService.verifyAdminRole(adminEmail);
            categoryService.deleteCategory(id);
            return ResponseEntity.ok("Category deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
