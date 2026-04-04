package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {

    List<ProjectFile> findByProject_Id(Long projectId);

    Optional<ProjectFile> findByProject_IdAndPath(Long projectId, String path);

    boolean existsByProject_IdAndPath(Long projectId, String path);
}
