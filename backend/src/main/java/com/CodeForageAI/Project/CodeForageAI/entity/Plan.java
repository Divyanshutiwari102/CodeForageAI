package com.CodeForageAI.Project.CodeForageAI.entity;

import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    PlanType name;

    Integer maxProjects;
    Long maxTokensPerMonth;
    Integer maxConcurrentPreviews;

    // old stripe (optional keep)
    String stripePriceId;

    // new razorpay
    String razorpayPlanId;
}