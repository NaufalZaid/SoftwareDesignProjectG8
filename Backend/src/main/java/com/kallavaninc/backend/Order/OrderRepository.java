package com.kallavaninc.backend.Order;

import com.kallavaninc.backend.Entities.Order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Find all orders placed by a specific customer
    List<Order> findByCustomerUserID(UUID customerId);

    // Find all orders for a specific seller's products
    List<Order> findByProductSellerUserID(UUID sellerId);
}
