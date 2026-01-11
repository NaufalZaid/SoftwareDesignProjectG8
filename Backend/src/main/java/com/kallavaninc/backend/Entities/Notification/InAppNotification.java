package com.kallavaninc.backend.Entities.Notification;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "in_app_notifications")
@Getter
@Setter
public class InAppNotification extends Notification {
}
