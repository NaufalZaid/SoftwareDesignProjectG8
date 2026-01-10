package com.kallavaninc.backend.DTO.LoginDTOs;

import lombok.Data;


@Data
public class LoginRequest {
    private String email;
    private String password;
}
