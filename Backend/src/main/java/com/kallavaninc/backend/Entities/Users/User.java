package com.kallavaninc.backend.Entities.Users;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;


import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED) // Matches the SQL above
@Data
public class User {
    @Id
    @GeneratedValue // Use with @UuidGenerator for UUIDs
    @UuidGenerator
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userID;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String role;

    @CreationTimestamp // Automatically sets the date
    private Date createdAt;
}
