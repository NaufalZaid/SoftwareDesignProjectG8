package com.kallavaninc.backend.Entities.Order;

import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Users.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter @Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_id")
    private UUID orderID;

    @Column(name = "date", columnDefinition = "TIMESTAMP")
    private LocalDateTime date = LocalDateTime.now();

    // Direct link to one Product
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer quantity;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;// (product.price * quantity)

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus shipmentStatus = ShipmentStatus.PROCESSING;

    @Column(name = "estimated_delivery", columnDefinition = "DATE")
    private Date estimatedDelivery;

    private String shippingAddress;

    public enum PaymentStatus { PAID, UNPAID, FAILED, PENDING }
    public enum ShipmentStatus { PROCESSING, SHIPPED, DELIVERED }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    public Order() {
    }

    public Order(LocalDateTime date, Product product, Integer quantity, BigDecimal totalAmount, PaymentStatus paymentStatus, ShipmentStatus shipmentStatus, Date estimatedDelivery, String shippingAddress, Customer customer) {
        this.date = date;
        this.product = product;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.shipmentStatus = shipmentStatus;
        this.estimatedDelivery = estimatedDelivery;
        this.shippingAddress = shippingAddress;
        this.customer = customer;
    }
}
