package com.kallavaninc.backend.Authentication;

import com.kallavaninc.backend.DTO.RegistrationDTOs.CustomerRegisterRequest;
import com.kallavaninc.backend.DTO.RegistrationDTOs.SellerRegisterRequest;
import com.kallavaninc.backend.Entities.Users.Customer;
import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.Entities.Users.User;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class AuthenticationService {
    private final AuthenticationRepository authenticationRepository;

    public AuthenticationService(AuthenticationRepository authenticationRepository) {
        this.authenticationRepository = authenticationRepository;
    }

    public User login(String email, String password) {

        User user = authenticationRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String hashedInput = DigestUtils.sha256Hex(password);

        if (!user.getPassword().equals(hashedInput)) {
            throw new RuntimeException("Incorrect password");
        }

        return user;
    }

    public void registerCustomer(CustomerRegisterRequest req) {
        if (authenticationRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        Customer customer = new Customer();
        customer.setEmail(req.getEmail());
        customer.setPassword(DigestUtils.sha256Hex(req.getPassword()));
        customer.setName(req.getName());
        customer.setShippingAddress(req.getShippingAddress());
        customer.setPhoneNumber(req.getPhoneNumber());
        customer.setRole("CUSTOMER");

        authenticationRepository.save(customer);
    }

    public void registerSeller(SellerRegisterRequest req) {
        if (authenticationRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        Seller seller = new Seller();
        seller.setEmail(req.getEmail());
        seller.setPassword(DigestUtils.sha256Hex(req.getPassword()));
        seller.setStoreName(req.getStoreName());
        seller.setRole("SELLER");

        try {
            if (req.getComplianceDocs() != null && !req.getComplianceDocs().isEmpty()) {
                // Storing actual bytes in the database as BYTEA
                seller.setComplianceDocs(req.getComplianceDocs().getBytes());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to process compliance document", e);
        }

        authenticationRepository.save(seller);
    }
}
