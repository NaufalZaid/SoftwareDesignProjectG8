package com.kallavaninc.backend.Notification;

import com.kallavaninc.backend.Entities.Notification.Notification;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Users.User;
import com.kallavaninc.backend.Notification.NotificationFactories.EmailNotificationFactory;
import com.kallavaninc.backend.Notification.NotificationFactories.InAppNotificationFactory;
import com.kallavaninc.backend.Observer.Observer;
import com.kallavaninc.backend.Observer.Subject;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService implements Observer, CommandLineRunner {

    private Subject orderService; // Your Subject

    private InAppNotificationFactory inAppFactory; // Factory 1

    private EmailNotificationFactory emailFactory; // Factory 2

    private NotificationRepository notificationRepository;

    public NotificationService(Subject orderService, InAppNotificationFactory inAppFactory, EmailNotificationFactory emailFactory, NotificationRepository notificationRepository) {
        this.orderService = orderService;
        this.inAppFactory = inAppFactory;
        this.emailFactory = emailFactory;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {
        // Register this service as an observer of the OrderService
        orderService.attach(this);
    }

    @Override
    public void update(Order order) {
        List<Notification> toSave = new ArrayList<>();

        // Navigate the relationship to find the Seller
        User seller = order.getProduct().getSeller();
        User customer = order.getCustomer();

        // 1. MESSAGES FOR CUSTOMER (Shipment Status)
        String customerMsg;
        if (order.getShipmentStatus() == Order.ShipmentStatus.PROCESSING) {
            customerMsg = "New Order: #" + order.getOrderID();
        } else {
            customerMsg = "Order #" + order.getOrderID() + " is now " + order.getShipmentStatus();
        }

        // --- 2. SELLER NOTIFICATION LOGIC (Payment status) ---
        String sellerMsg;
        if (order.getPaymentStatus() == Order.PaymentStatus.UNPAID) {
            sellerMsg = "New order placed for " + order.getProduct().getName();
        } else {
            sellerMsg = "Payment update for " + order.getOrderID() + ": " + order.getPaymentStatus();
        }

        //
        toSave.add(inAppFactory.createNotification(order, customer, customerMsg));
        toSave.add(emailFactory.createNotification(order, customer, customerMsg));
        toSave.add(inAppFactory.createNotification(order, seller, sellerMsg));
        toSave.add(emailFactory.createNotification(order, seller, sellerMsg));

        notificationRepository.saveAll(toSave);
    }
}
