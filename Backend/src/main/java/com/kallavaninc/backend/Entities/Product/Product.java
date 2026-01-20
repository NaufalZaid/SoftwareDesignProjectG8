package com.kallavaninc.backend.Entities.Product;

import com.kallavaninc.backend.Entities.Inventory.Inventory;
import com.kallavaninc.backend.Entities.Users.Seller;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;


@Entity
@Table(name = "products")
@Getter @Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "product_id")
    private UUID id;

    @Column(unique = true, nullable = false)
    private String sku;

    private String name;
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    private String category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Seller seller;

    public enum ProductStatus {
        AVAILABLE, OUT_OF_STOCK, DISCONTINUED
    }

    public Product() {
    }

    public Product(String sku, String name, String brand, String description, BigDecimal price, ProductStatus status, List<ProductImage> images, Seller seller, String category) {
        this.sku = sku;
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.status = status;
        this.images = (images != null) ? images : new ArrayList<>();
        this.seller = seller;
        this.category = category;
    }
}