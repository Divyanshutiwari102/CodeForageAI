package com.CodeForageAI.Project.CodeForageAI.entity;

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
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_payment_txn_user_id", columnList = "user_id"),
        @Index(name = "idx_payment_txn_payment_id", columnList = "provider_payment_id", unique = true),
        @Index(name = "idx_payment_txn_order_id", columnList = "provider_order_id")
})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    Plan plan;

    @Column(name = "payment_provider", nullable = false)
    String paymentProvider;

    @Column(name = "provider_order_id", nullable = false)
    String providerOrderId;

    @Column(name = "provider_payment_id", nullable = false, unique = true)
    String providerPaymentId;

    @Column(name = "provider_signature", nullable = false)
    String providerSignature;

    @Column(nullable = false)
    String status;

    @CreationTimestamp
    Instant createdAt;

    @UpdateTimestamp
    Instant updatedAt;
}
