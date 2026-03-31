package org.hartford.surehealth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ChangePasswordDTO;
import org.hartford.surehealth.dto.LoginRequestDTO;
import org.hartford.surehealth.dto.LoginResponseDTO;
import org.hartford.surehealth.service.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authService.login(request.getUsername(), request.getPassword());
    }

    @PostMapping("/change-password")
    public void changePassword(@Valid @RequestBody ChangePasswordDTO request, Authentication auth) {
        authService.changePassword(auth.getName(), request.getOldPassword(), request.getNewPassword());
    }

    @PostMapping("/forgot-password")
    public java.util.Map<String, String> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String token = authService.forgotPassword(body.get("username"));
        return java.util.Map.of(
            "message", "Reset code generated successfully.",
            "token", token
        );
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody java.util.Map<String, String> body) {
        authService.resetPassword(body.get("username"), body.get("token"), body.get("newPassword"));
    }
}



