package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.Notification;
import org.hartford.surehealth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // As per user requirement, we only fetch notifications that have NOT been read
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
    
    // For unread count badge
    long countByRecipientAndIsReadFalse(User recipient);
    
    // Used if we wanted to mark all as read
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
}
