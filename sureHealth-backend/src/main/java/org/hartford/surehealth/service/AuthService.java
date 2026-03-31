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
    private final NotificationService notificationService;

    public LoginResponseDTO login(String username, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new InvalidCredentialsException("User not found"));

            if (user.getFirstLogin() != null && user.getFirstLogin()) {
                notificationService.createNotification(
                    user,
                    "Welcome to SureHealth! We're glad to have you on board.",
                    org.hartford.surehealth.enums.NotificationType.INFO
                );
                user.setFirstLogin(false);
                userRepository.save(user);
            }

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

        notificationService.createNotification(
            user,
            "Your password has been successfully changed.",
            org.hartford.surehealth.enums.NotificationType.SUCCESS
        );
    }

    @Transactional
    public String forgotPassword(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (user.getRole() == org.hartford.surehealth.enums.Role.ADMIN) {
            throw new InvalidCredentialsException("Password reset not allowed for Administrator role");
        }

        // Generate 6-digit token
        String token = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Simulate email by logging to console and creating a notification (if they could see it, but they can't log in)
        System.out.println("DEBUG: Password reset token for " + username + " is: " + token);
        
        // We still create a notification so if they regain access they see it
        notificationService.createNotification(
            user,
            "A password reset was requested. Your token is: " + token,
            org.hartford.surehealth.enums.NotificationType.ALERT
        );
        
        return token;
    }

    @Transactional
    public void resetPassword(String username, String token, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (user.getResetToken() == null || !user.getResetToken().equals(token)) {
            throw new InvalidCredentialsException("Invalid reset token");
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        notificationService.createNotification(
            user,
            "Your password has been successfully reset. You can now log in with your new password.",
            org.hartford.surehealth.enums.NotificationType.SUCCESS
        );
    }
}
