package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.Preview;
import com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreviewRepository extends JpaRepository<Preview, Long> {

    List<Preview> findByProject_IdOrderByCreatedAtDesc(Long projectId);

    Optional<Preview> findFirstByProject_IdAndStatusOrderByCreatedAtDesc(Long projectId, PreviewStatus status);

    List<Preview> findByStatus(PreviewStatus status);

    @Query("SELECT COUNT(p) FROM Preview p WHERE p.status = com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus.RUNNING AND p.project.id IN :projectIds")
    int countRunningByProjectIds(@Param("projectIds") List<Long> projectIds);
}
