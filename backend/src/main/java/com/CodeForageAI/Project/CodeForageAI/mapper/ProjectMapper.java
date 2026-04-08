package com.CodeForageAI.Project.CodeForageAI.mapper;

import com.CodeForageAI.Project.CodeForageAI.dto.project.ProjectResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.project.ProjectSummaryResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ProjectResponse toProjectResponse(Project project);

    @Mapping(target = "projectName", source = "name")
    ProjectSummaryResponse toProjectSummaryResponse(Project project);

    List<ProjectSummaryResponse> toListOfProjectSummaryResponse(List<Project> projects);

}
