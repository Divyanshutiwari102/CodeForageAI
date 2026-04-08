package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.ProjectMember;
import com.CodeForageAI.Project.CodeForageAI.entity.ProjectMemberId;
import com.CodeForageAI.Project.CodeForageAI.enums.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {

    List<ProjectMember> findByIdProjectId(Long projectId);

    long countByUser_IdAndProjectRole(Long userId, ProjectRole projectRole);
}
