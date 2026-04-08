package com.CodeForageAI.Project.CodeForageAI.mapper;

import com.CodeForageAI.Project.CodeForageAI.dto.auth.SignupRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.auth.UserProfileResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(SignupRequest signupRequest);

    UserProfileResponse toUserProfileResponse(User user);

}
