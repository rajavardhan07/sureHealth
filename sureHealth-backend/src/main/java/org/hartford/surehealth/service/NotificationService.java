package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.NotificationDTO;
import org.hartford.surehealth.entity.Notification;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.NotificationType;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.hartford.surehealth.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(User recipient, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        
        // Ensure user owns this notification
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized application of notification read status.");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsReadFalse(user);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
