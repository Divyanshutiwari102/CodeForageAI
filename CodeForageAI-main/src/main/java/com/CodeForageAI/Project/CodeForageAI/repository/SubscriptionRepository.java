package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.Subscription;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByProviderSubscriptionId(String providerSubscriptionId);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.status = :status")
    Optional<Subscription> findByUserIdAndStatus(@Param("userId") Long userId,
                                                 @Param("status") SubscriptionStatus status);

    default Optional<Subscription> findActiveByUserId(Long userId) {
        return findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE);
    }
}