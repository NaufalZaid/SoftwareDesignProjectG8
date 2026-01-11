package com.kallavaninc.backend.Entities.Notification;

import com.kallavaninc.backend.Entities.Users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public abstract class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID notificationId;

    @Column(nullable = false)
    private String message;

    @Column(name = "estimated_delivery", columnDefinition = "DATE")
    private Date date = new Date();

    @Column(name = "time_sent", columnDefinition = "TIMESTAMP")
    private LocalDateTime timeSent = LocalDateTime.now();

    private boolean isRead = false;

    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Recipient (Customer or Seller)
}
