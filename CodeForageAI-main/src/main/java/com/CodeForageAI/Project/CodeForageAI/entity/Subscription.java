package com.CodeForageAI.Project.CodeForageAI.entity;

import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "subscriptions", indexes = {
        @Index(name = "idx_subscription_user_id", columnList = "user_id"),
        @Index(name = "idx_subscription_provider_sub_id", columnList = "provider_subscription_id")
})
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    Plan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SubscriptionStatus status;

    // NEW: provider-neutral fields
    String paymentProvider; // RAZORPAY / STRIPE

    @Column(name = "provider_customer_id")
    String providerCustomerId;

    @Column(name = "provider_subscription_id", unique = true)
    String providerSubscriptionId;

    Instant currentPeriodStart;
    Instant currentPeriodEnd;

    @Builder.Default
    Boolean cancelAtPeriodEnd = false;

    @CreationTimestamp
    Instant createdAt;

    @UpdateTimestamp
    Instant updatedAt;
}