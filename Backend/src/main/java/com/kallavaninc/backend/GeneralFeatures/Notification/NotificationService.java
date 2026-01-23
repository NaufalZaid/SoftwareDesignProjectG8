package com.kallavaninc.backend.GeneralFeatures.Notification;

import com.kallavaninc.backend.Entities.Notification.Notification;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Users.User;
import com.kallavaninc.backend.GeneralFeatures.Notification.NotificationFactories.EmailNotificationFactory;
import com.kallavaninc.backend.GeneralFeatures.Notification.NotificationFactories.InAppNotificationFactory;
import com.kallavaninc.backend.GeneralFeatures.Observer.Observer;
import com.kallavaninc.backend.GeneralFeatures.Observer.Subject;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    public void run(String... args) { // this runs as soon as the project is launched
        // Register this service as an observer of the OrderService
        orderService.attach(this);
    }

    @Override
    public void update(Order order, String eventType) {
        List<Notification> toSave = new ArrayList<>();
        User seller = order.getProduct().getSeller();
        User customer = order.getCustomer();
        // Initial Order Creation Event
        if ("ORDER_CREATED".equals(eventType)) {
            String customerMsg = "Order #" + order.getOrderID() + " placed successfully!";
            String sellerMsg = "New order received for: " + order.getProduct().getName();

            // Notify both parties of the new transaction
            toSave.add(inAppFactory.createNotification(order, customer, customerMsg));
            toSave.add(emailFactory.createNotification(order, customer, customerMsg));
            toSave.add(inAppFactory.createNotification(order, seller, sellerMsg));
            toSave.add(emailFactory.createNotification(order, seller, sellerMsg));
        }
        // Shipment Status Changes
        else if ("SHIPMENT_UPDATE".equals(eventType)) {
            String msg = "Order #" + order.getOrderID() + " status: " + order.getShipmentStatus();

            // only the customer needs shipment updates
            toSave.add(inAppFactory.createNotification(order, customer, msg));
            toSave.add(emailFactory.createNotification(order, customer, msg));
        }
        // Payment Status Changes
        else if ("PAYMENT_UPDATE".equals(eventType)) {
            String msg = "Payment for Order #" + order.getOrderID() + " is now " + order.getPaymentStatus();

            // Notify the seller so they know when to ship
            toSave.add(inAppFactory.createNotification(order, seller, msg));
            toSave.add(emailFactory.createNotification(order, seller, msg));
        }
        // Save only if events matched
        if (!toSave.isEmpty()) {
            notificationRepository.saveAll(toSave);
        }
    }

    public List<Notification> getNotificationsByUserId(UUID userId) {
        return notificationRepository.findByUser_UserID(userId);
    }

    public List<Notification> getNotificationsByUserIdAndType(UUID userId, String Type) {
        return notificationRepository.findByUser_UserIDAndType(userId, Type);
    }
}
