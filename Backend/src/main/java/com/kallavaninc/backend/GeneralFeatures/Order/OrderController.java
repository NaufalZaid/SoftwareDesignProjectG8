package com.kallavaninc.backend.GeneralFeatures.Order;

import com.kallavaninc.backend.Entities.Order.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // View every order in the system (Admin View)
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Update the Payment Status // make payment logic for this, should be system triggered
    @PatchMapping("/{orderId}/payment")
    public ResponseEntity<Order> updatePayment(
            @PathVariable UUID orderId,
            @RequestParam Order.PaymentStatus status) {
        return ResponseEntity.ok(orderService.updatePaymentStatus(orderId, status));
    }
}
