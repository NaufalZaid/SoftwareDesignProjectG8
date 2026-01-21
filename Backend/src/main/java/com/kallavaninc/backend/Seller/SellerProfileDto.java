package com.kallavaninc.backend.Seller;

import java.util.UUID;
import java.util.Date;


public record SellerProfileDto(
        UUID userId,
        String email,
        String storeName,
        String status,
        Date createdAt
) {}
