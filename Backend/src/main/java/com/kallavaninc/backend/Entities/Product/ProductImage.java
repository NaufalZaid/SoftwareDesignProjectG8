package com.kallavaninc.backend.Entities.Product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products_images")
@Getter @Setter
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Internal ID for the image table

    private String fileName; // Stores: "uuid_myphoto.jpg"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore // Important: Prevents infinite loops in JSON
    private Product product;

    public ProductImage() {
    }

    public ProductImage(Long id, String fileName, Product product) {
        this.id = id;
        this.fileName = fileName;
        this.product = product;
    }
}
