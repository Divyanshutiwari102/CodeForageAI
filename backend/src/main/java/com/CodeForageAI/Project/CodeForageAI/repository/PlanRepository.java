package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    Optional<Plan> findByName(PlanType name);
}
