package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ChangePasswordDTO;
import org.hartford.surehealth.dto.LoginRequestDTO;
import org.hartford.surehealth.dto.LoginResponseDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.exceptions.InvalidCredentialsException;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new InvalidCredentialsException("User not found"));

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

            return new LoginResponseDTO(token, user.getUsername(), user.getRole().name());

        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    @PostMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordDTO request, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Old password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}


