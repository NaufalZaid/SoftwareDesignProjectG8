package com.kallavaninc.backend.Entities.Inventory;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Users.Seller;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Getter
@Setter
public class Inventory {

    public Inventory(UUID id, Product product, Integer quantity) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
    }

    public Inventory() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "inventory_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Added Seller reference for ownership verification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnore
    private Seller seller;

    @Column(nullable = false)
    private Integer quantity;
}
