package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.LoginResponseDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.exceptions.InvalidCredentialsException;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO login(String username, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new InvalidCredentialsException("User not found"));

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

            return new LoginResponseDTO(token, user.getUsername(), user.getRole().name());

        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
