package com.kallavaninc.backend.Category;

import com.kallavaninc.backend.Entities.Category.Category;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Get all categories (flat list)
    public List<Category> getAllCategories() {
        return categoryRepository.findAllOrderedByName();
    }

    // Get category by ID
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
    }

    // Get root categories (no parent)
    public List<Category> getRootCategories() {
        return categoryRepository.findByParentIsNull();
    }

    // Get children of a category
    public List<Category> getChildCategories(UUID parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    // Get hierarchical tree structure
    public List<Map<String, Object>> getCategoryTree() {
        List<Category> rootCategories = getRootCategories();
        List<Map<String, Object>> tree = new ArrayList<>();

        for (Category root : rootCategories) {
            tree.add(buildTreeNode(root));
        }

        return tree;
    }

    private Map<String, Object> buildTreeNode(Category category) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", category.getId());
        node.put("name", category.getName());
        node.put("description", category.getDescription());
        node.put("icon", category.getIcon());
        node.put("parentId", category.getParentId());
        node.put("createdAt", category.getCreatedAt());

        List<Category> children = getChildCategories(category.getId());
        if (!children.isEmpty()) {
            List<Map<String, Object>> childNodes = new ArrayList<>();
            for (Category child : children) {
                childNodes.add(buildTreeNode(child));
            }
            node.put("children", childNodes);
        } else {
            node.put("children", Collections.emptyList());
        }

        return node;
    }

    // Create a new category
    @Transactional
    public Category createCategory(Category category) {
        // Check if name already exists
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category with name '" + category.getName() + "' already exists");
        }

        // If parentId is provided, verify parent exists
        if (category.getParentId() != null) {
            Category parent = categoryRepository.findById(category.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        }

        return categoryRepository.save(category);
    }

    // Update an existing category
    @Transactional
    public Category updateCategory(UUID id, Category updatedData) {
        Category existing = getCategoryById(id);

        // Check if new name conflicts with existing (excluding self)
        if (!existing.getName().equals(updatedData.getName()) &&
                categoryRepository.existsByName(updatedData.getName())) {
            throw new RuntimeException("Category with name '" + updatedData.getName() + "' already exists");
        }

        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());
        existing.setIcon(updatedData.getIcon());

        // Update parent if changed
        if (updatedData.getParentId() != null) {
            // Prevent setting self as parent
            if (updatedData.getParentId().equals(id)) {
                throw new RuntimeException("Category cannot be its own parent");
            }
            Category newParent = categoryRepository.findById(updatedData.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            existing.setParent(newParent);
        } else {
            existing.setParent(null);
        }

        return categoryRepository.save(existing);
    }

    // Delete a category
    @Transactional
    public void deleteCategory(UUID id) {
        Category category = getCategoryById(id);

        // Children will have their parent_id set to NULL due to ON DELETE SET NULL
        categoryRepository.delete(category);
    }
}
