package com.kallavaninc.backend.UserFeatures.Authentication;

import com.kallavaninc.backend.DTO.LoginDTOs.LoginRequest;
import com.kallavaninc.backend.DTO.LoginDTOs.LoginResponse;
import com.kallavaninc.backend.DTO.RegistrationDTOs.CustomerRegisterRequest;
import com.kallavaninc.backend.DTO.RegistrationDTOs.SellerRegisterRequest;
import com.kallavaninc.backend.Entities.Users.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = authenticationService.login(loginRequest.getEmail(), loginRequest.getPassword());

            // ADDED: Include the UUID (user_id) so the frontend can store it
            LoginResponse response = new LoginResponse(
                    user.getUserID(),
                    user.getEmail(),
                    user.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/register/customer")
    public ResponseEntity<String> registerCustomer(@RequestBody CustomerRegisterRequest request) {
        try {
            authenticationService.registerCustomer(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Customer account created!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/register/seller", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> registerSeller(@ModelAttribute SellerRegisterRequest request) {
        try {
            authenticationService.registerSeller(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Seller account created and pending approval!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}

