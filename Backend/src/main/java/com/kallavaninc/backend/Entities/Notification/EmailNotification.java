package com.kallavaninc.backend.Entities.Notification;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "email_notifications")
@Getter
@Setter
public class EmailNotification extends Notification {
    private String recipientEmail;
}

