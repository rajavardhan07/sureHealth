package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.NotificationDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(notificationService.getUnreadNotificationCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        notificationService.markAsRead(id, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        User user = getCurrentUser(auth);
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }
}
