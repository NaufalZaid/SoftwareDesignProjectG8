package com.kallavaninc.backend.GeneralFeatures.Notification.NotificationFactories;

import com.kallavaninc.backend.Entities.Notification.EmailNotification;
import com.kallavaninc.backend.Entities.Notification.Notification;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Users.User;
import org.springframework.stereotype.Component;

@Component
public class EmailNotificationFactory implements NotificationFactory {

    @Override
    public Notification createNotification(Order order, User recipient, String message) {
        EmailNotification email = new EmailNotification();
        email.setMessage(message);
        email.setUser(recipient);
        email.setRecipientEmail(recipient.getEmail());
        email.setDate(order.getEstimatedDelivery());
        email.setType("email");
        return email;
    }
}
