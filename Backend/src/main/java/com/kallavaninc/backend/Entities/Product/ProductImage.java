package com.kallavaninc.backend.Entities.Product;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "product_images")
@Getter @Setter
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Internal ID for the image table

    private String fileName;

    @Lob
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "image_data", columnDefinition = "BYTEA")
    private byte[] imageData;

    // Link to the Product using UUID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public ProductImage() {
    }

    public ProductImage(Long id, String fileName, byte[] imageData, Product product) {
        this.id = id;
        this.fileName = fileName;
        this.imageData = imageData;
        this.product = product;
    }
}
