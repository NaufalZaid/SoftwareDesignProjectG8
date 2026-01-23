package com.kallavaninc.backend.UserFeatures.Customer;

import com.kallavaninc.backend.DTO.CustomerDTO.CustomerProfileDTO;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import com.kallavaninc.backend.GeneralFeatures.Order.OrderService;
import com.kallavaninc.backend.GeneralFeatures.Payment.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final OrderService orderService;
    private final WalletRepository walletRepository;
    private final CustomerService customerService;

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

    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable UUID userId) {
        Wallet wallet = walletRepository.findByUserUserID(userId);

        if (wallet != null) {
            return ResponseEntity.ok(wallet.getBalance());
        }

        // Return 0.00 if user has no wallet
        return ResponseEntity.ok(BigDecimal.ZERO);
    }

    @PostMapping("/order/{orderId}/pay")
    public ResponseEntity<String> payForOrder(@PathVariable UUID orderId) {
        // 1. Find the order first
        Order order = orderService.getOrderById(orderId);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // 2. Check if it's already paid to avoid double charges
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            return ResponseEntity.badRequest().body("Order is already paid.");
        }

        // 3. Trigger the payment processing logic
        orderService.processPayment(order);

        // 4. Return success (The status will be updated inside processPayment)
        return ResponseEntity.ok("Payment processed. Check your status.");
    }

    @PostMapping("/wallet/{userId}/topup")
    public ResponseEntity<String> topUpWallet(
            @PathVariable UUID userId,
            @RequestParam BigDecimal amount) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Top-up amount must be positive.");
        }

        customerService.topUpWallet(userId, amount);
        return ResponseEntity.ok("Top-up successful! New balance updated.");
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<CustomerProfileDTO> getProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(customerService.getCustomerProfile(userId));
    }
}
