package com.kallavaninc.backend.DTO.CustomerDTO;

import lombok.Data;

import java.util.Date;

@Data
public class CustomerProfileDTO {
    
    public CustomerProfileDTO(String name, String email, String shippingAddress, String phoneNumber, String role, Date createdAt) {
        this.name = name;
        this.email = email;
        this.shippingAddress = shippingAddress;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.createdAt = createdAt;
    }

    private String name;
    private String email;
    private String shippingAddress;
    private String phoneNumber;
    private String role;
    private Date createdAt;
}