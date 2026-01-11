package com.kallavaninc.backend.Order;

import com.kallavaninc.backend.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Users.Customer;
import com.kallavaninc.backend.Observer.Observer;
import com.kallavaninc.backend.Observer.Subject;
import com.kallavaninc.backend.Product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService implements Subject {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AuthenticationRepository authRepo;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, AuthenticationRepository authRepo) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.authRepo = authRepo;
    }

    private final List<Observer> observers = new ArrayList<>();

    // --- SUBJECT INTERFACE METHODS ---
    @Override
    public void attach(Observer observer) {
        observers.add(observer);
    }

    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(Order order) {
        for (Observer observer : observers) {
            observer.update(order);
        }
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

        LocalDate deliveryDate = LocalDate.now().plusDays(7);
        Date dateValue = java.sql.Date.valueOf(deliveryDate);
        order.setEstimatedDelivery(dateValue);

        // 3. Logic: Calculate total amount
        // Inside placeOrder method
        BigDecimal unitPrice = product.getPrice();
        BigDecimal qty = new BigDecimal(quantity);
        order.setTotalAmount(unitPrice.multiply(qty));

        Order savedOrder = orderRepository.save(order);

        // Notify observers to send "New Order" notifications
        notifyObservers(savedOrder);

        return savedOrder;
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

        // Save to Database
        Order updatedOrder = orderRepository.save(order);

        // Notify observers to send status update notifications
        notifyObservers(updatedOrder);

        return updatedOrder;
    }

    // UPDATE Shipment Status
    public Order updateShipmentStatus(UUID orderId, Order.ShipmentStatus status) {
        Order order = getOrderById(orderId);
        order.setShipmentStatus(status);

        // Save to Database
        Order updatedOrder = orderRepository.save(order);

        // Notify observers to send status update notifications
        notifyObservers(updatedOrder);

        return updatedOrder;
    }
}
