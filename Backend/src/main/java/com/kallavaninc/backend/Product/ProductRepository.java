package com.kallavaninc.backend.Product;

import com.kallavaninc.backend.Entities.Product.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    // Find all products posted by a specific seller
    List<Product> findBySellerUserID(UUID sellerId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.images WHERE p.seller.userID = :sellerId")
    List<Product> findBySellerWithImages(@Param("sellerId") UUID sellerId);

    Optional<Product> findByIdAndSellerUserID(UUID productId, UUID sellerId);

    List<Product> findByCategory(String category);
}
