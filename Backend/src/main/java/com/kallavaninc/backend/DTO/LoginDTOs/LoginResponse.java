package com.kallavaninc.backend.DTO.LoginDTOs;

import lombok.Data;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
public class LoginResponse {

    private UUID userID;
    private String email;
    private String user_role;    // Customer, Seller, or Administrato
}
