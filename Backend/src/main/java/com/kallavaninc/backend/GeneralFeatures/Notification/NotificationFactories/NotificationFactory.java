package com.kallavaninc.backend.GeneralFeatures.Notification.NotificationFactories;

import com.kallavaninc.backend.Entities.Notification.Notification;
import com.kallavaninc.backend.Entities.Order.Order;
import com.kallavaninc.backend.Entities.Users.User;

public interface NotificationFactory {
    // We add a custom message parameter so the Factory stays generic
    Notification createNotification(Order order, User recipient, String message);
}