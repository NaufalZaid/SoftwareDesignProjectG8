package com.kallavaninc.backend.GeneralFeatures.Notification;

import com.kallavaninc.backend.Entities.Notification.Notification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userID}")
    public List<Notification> getNotificationsByUserId(@PathVariable UUID userID){
        return notificationService.getNotificationsByUserId(userID);
    }
}
