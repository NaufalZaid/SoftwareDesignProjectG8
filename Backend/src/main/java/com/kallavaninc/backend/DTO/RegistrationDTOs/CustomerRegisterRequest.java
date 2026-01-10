package com.kallavaninc.backend.DTO.RegistrationDTOs;

import lombok.Data;

@Data
public class CustomerRegisterRequest {
    private String email;
    private String password;
    private String name;
    private String shippingAddress;
    private String phoneNumber;
}