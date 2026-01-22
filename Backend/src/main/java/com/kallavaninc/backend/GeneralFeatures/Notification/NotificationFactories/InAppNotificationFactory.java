package com.kallavaninc.backend.GeneralFeatures.Notification.NotificationFactories;

import com.kallavaninc.backend.Entities.Notification.InAppNotification;
import com.kallavaninc.backend.Entities.Notification.Notification;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Users.User;
import org.springframework.stereotype.Component;

@Component
public class InAppNotificationFactory implements NotificationFactory {
    @Override
    public Notification createNotification(Order order, User recipient, String message) {
        InAppNotification note = new InAppNotification();
        note.setMessage(message);
        note.setUser(recipient);
        note.setDate(order.getEstimatedDelivery());
        note.setType("InApp");
        return note;
    }
}
