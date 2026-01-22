package com.kallavaninc.backend.Order;

import com.kallavaninc.backend.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Payment.Transaction;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Users.Customer;
import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Inventory.InventoryService;
import com.kallavaninc.backend.Observer.Observer;
import com.kallavaninc.backend.Observer.Subject;
import com.kallavaninc.backend.Entities.Payment.Wallet;
import com.kallavaninc.backend.Payment.TransactionRepository;
import com.kallavaninc.backend.Payment.WalletRepository;
import com.kallavaninc.backend.Product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;



@Service
public class OrderService implements Subject {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AuthenticationRepository authRepo;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, AuthenticationRepository authRepo, WalletRepository walletRepo, TransactionRepository transactionRepository, InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.authRepo = authRepo;
        this.walletRepository = walletRepo;
        this.transactionRepository = transactionRepository;
        this.inventoryService = inventoryService;
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
    public void notifyObservers(Order order, String eventType) {
        for (Observer observer : observers) {
            observer.update(order, eventType );
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

        // Quick check to see if it's even worth creating the order
        if (!inventoryService.isInStock(productId, quantity)) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }

        // 2. Create Order and set details
        Order order = new Order();
        order.setCustomer(customer);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setShippingAddress(address);
        order.setPaymentStatus(Order.PaymentStatus.PENDING); // Mark as pending

        LocalDate deliveryDate = LocalDate.now().plusDays(7);
        Date dateValue = java.sql.Date.valueOf(deliveryDate);
        order.setEstimatedDelivery(dateValue);

        // 3. Logic: Calculate total amount
        BigDecimal unitPrice = product.getPrice();
        BigDecimal qty = new BigDecimal(quantity);
        order.setTotalAmount(unitPrice.multiply(qty));

        // Save the order WITHOUT deducting stock yet
        Order savedOrder = orderRepository.save(order);

        // Notify observers
        notifyObservers(savedOrder, "ORDER_CREATED");

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

    @Transactional
    public void processPayment(Order order) {
        // 1. FINAL Stock Check (Safety check right before the money moves)
        if (!inventoryService.isInStock(order.getProduct().getId(), order.getQuantity())) {
            updatePaymentStatus(order.getOrderID(), Order.PaymentStatus.FAILED);
            throw new RuntimeException("Product went out of stock before payment was finalized!");
        }

        Wallet customerWallet = walletRepository.findByUser(order.getCustomer());
        Wallet sellerWallet = walletRepository.findByUser(order.getProduct().getSeller());
        BigDecimal amount = order.getTotalAmount();

        // 2. Wallet Balance Check
        if (customerWallet.getBalance().compareTo(amount) < 0) {
            updatePaymentStatus(order.getOrderID(), Order.PaymentStatus.FAILED);
            return; // No stock was touched
        }

        // 3. Perform the transfer
        customerWallet.setBalance(customerWallet.getBalance().subtract(amount));
        sellerWallet.setBalance(sellerWallet.getBalance().add(amount));
        walletRepository.save(customerWallet);
        walletRepository.save(sellerWallet);

        // 4. MINUS STOCK NOW
        // Since payment is successful, we finally commit the stock change
        inventoryService.deductStock(order.getProduct().getId(), order.getQuantity());

        updatePaymentStatus(order.getOrderID(), Order.PaymentStatus.PAID);
    }

    // UPDATE Payment Status
    public Order updatePaymentStatus(UUID orderId, Order.PaymentStatus status) {
        Order order = getOrderById(orderId);
        order.setPaymentStatus(status);

        // Save to Database
        Order updatedOrder = orderRepository.save(order);

        logTransaction(updatedOrder, updatedOrder.getPaymentStatus());

        // Notify observers to send status update notifications
        notifyObservers(updatedOrder, "PAYMENT_UPDATE");


        return updatedOrder;
    }

    // UPDATE Shipment Status
    public Order updateShipmentStatus(UUID orderId, Order.ShipmentStatus status) {
        Order order = getOrderById(orderId);
        order.setShipmentStatus(status);

        // Save to Database
        Order updatedOrder = orderRepository.save(order);

        // Notify observers to send status update notifications
        notifyObservers(updatedOrder, "SHIPMENT_UPDATE");

        return updatedOrder;
    }

    private void logTransaction(Order order, Order.PaymentStatus status) {
        Transaction transactionLog = new Transaction();
        transactionLog.setSender(order.getCustomer());
        transactionLog.setReceiver(order.getProduct().getSeller());
        transactionLog.setAmount(order.getTotalAmount());
        transactionLog.setDescription("Payment for Order #" + order.getOrderID());
        if (status == Order.PaymentStatus.PAID) {
            transactionLog.setStatus("PAID");
        }
        else if(status == Order.PaymentStatus.UNPAID){
            transactionLog.setStatus("UNPAID");
        }
        else{
            transactionLog.setStatus("FAILED");}
        transactionLog.setTimestamp(LocalDateTime.now());
        transactionRepository.save(transactionLog);}
}
