package com.kallavaninc.backend.Category;

import com.kallavaninc.backend.Entities.Category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    // Find all root categories (categories without a parent)
    List<Category> findByParentIsNull();

    // Find all children of a specific category
    List<Category> findByParentId(UUID parentId);

    // Find category by name
    Category findByName(String name);

    // Check if category name already exists
    boolean existsByName(String name);

    // Find all categories ordered by name
    @Query("SELECT c FROM Category c ORDER BY c.name ASC")
    List<Category> findAllOrderedByName();
}
