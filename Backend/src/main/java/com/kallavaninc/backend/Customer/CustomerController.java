package com.kallavaninc.backend.Customer;

import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final OrderService orderService;

    @PostMapping("/{customerId}/order/{productId}")
    public ResponseEntity<Order> placeOrder(
            @PathVariable UUID customerId,
            @PathVariable UUID productId,
            @RequestParam Integer quantity,
            @RequestParam String address) {

        Order newOrder = orderService.placeOrder(customerId, productId, quantity, address);
        return ResponseEntity.ok(newOrder);
    }

    // GET: Retrieve the purchase history for a specific customer
    @GetMapping("/{customerId}/orders")
    public ResponseEntity<List<Order>> getMyOrders(@PathVariable UUID customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    // GET: View details of a specific order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }
}
