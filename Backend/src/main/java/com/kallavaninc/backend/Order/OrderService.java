package com.kallavaninc.backend.Order;

import com.kallavaninc.backend.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Users.Customer;
import com.kallavaninc.backend.Product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AuthenticationRepository authRepo;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, AuthenticationRepository authRepo) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.authRepo = authRepo;
    }

    public Order getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order placeOrder(UUID customerId, UUID productId, Integer quantity, String address) {
        // 1. Fetch Customer and Product
        Customer customer = (Customer) authRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Create Order and set details
        Order order = new Order();
        order.setCustomer(customer);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setShippingAddress(address);

        // 3. Logic: Calculate total amount
        // Inside placeOrder method
        BigDecimal unitPrice = product.getPrice();
        BigDecimal qty = new BigDecimal(quantity);
        order.setTotalAmount(unitPrice.multiply(qty));

        // 4. Save to Database
        return orderRepository.save(order);
    }

    // GET orders for a specific customer
    public List<Order> getOrdersByCustomer(UUID customerId) {
        return orderRepository.findByCustomerUserID(customerId);
    }

    // GET orders for a specific seller
    public List<Order> getOrdersBySeller(UUID sellerId) {
        return orderRepository.findByProductSellerUserID(sellerId);
    }

    // UPDATE Payment Status
    public Order updatePaymentStatus(UUID orderId, Order.PaymentStatus status) {
        Order order = getOrderById(orderId);
        order.setPaymentStatus(status);
        return orderRepository.save(order);
    }

    // UPDATE Shipment Status
    public Order updateShipmentStatus(UUID orderId, Order.ShipmentStatus status) {
        Order order = getOrderById(orderId);
        order.setShipmentStatus(status);
        return orderRepository.save(order);
    }
}
