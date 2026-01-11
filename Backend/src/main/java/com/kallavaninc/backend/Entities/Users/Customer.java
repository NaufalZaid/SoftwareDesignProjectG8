package com.kallavaninc.backend.Entities.Users;

import com.kallavaninc.backend.Entities.Order.Order;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity // Necessary for JPA to recognize this as a table
@Table(name = "customers") //  Maps to the customers table
@Getter @Setter
@EqualsAndHashCode(callSuper = true)
public class Customer extends User {
    private String name;
    private String shippingAddress;
    private String phoneNumber;
}
