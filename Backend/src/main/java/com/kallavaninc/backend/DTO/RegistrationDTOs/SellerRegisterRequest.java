package com.kallavaninc.backend.DTO.RegistrationDTOs;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class SellerRegisterRequest {
    private String email;
    private String password;
    private String name;
    private String storeName;
    private MultipartFile complianceDocs;
}