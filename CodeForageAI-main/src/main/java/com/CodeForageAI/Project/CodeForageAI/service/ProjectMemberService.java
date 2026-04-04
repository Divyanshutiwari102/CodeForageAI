package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.member.InviteMemberRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.member.MemberResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.member.UpdateMemberRoleRequest;

import java.util.List;

public interface ProjectMemberService {
    List<MemberResponse> getProjectMembers(Long projectId);

    MemberResponse inviteMember(Long projectId, InviteMemberRequest request);

    MemberResponse updateMemberRole(Long projectId, Long memberId, UpdateMemberRoleRequest request);

    void removeProjectMember(Long projectId, Long memberId);
}
