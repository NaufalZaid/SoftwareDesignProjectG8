package com.kallavaninc.backend.Entities.Users;

import com.kallavaninc.backend.Entities.Product.Product;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "sellers")
@Getter @Setter
@EqualsAndHashCode(callSuper = true) // <--- Crucial for Inheritance
public class Seller extends User {
    private String storeName;
    private boolean isApproved;

    @Lob
    @JdbcTypeCode(SqlTypes.BINARY) // Force direct binary mapping for BYTEA
    @Column(name = "compliance_docs", columnDefinition = "BYTEA")
    private byte[] complianceDocs; // The actual file bytes are stored here

    // @onetomany annotation links the Seller to all the Products they post
    // 'mappedBy' tells JPA that the 'seller' field in the Product class owns the relationship
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Product> products = new ArrayList<>();
}