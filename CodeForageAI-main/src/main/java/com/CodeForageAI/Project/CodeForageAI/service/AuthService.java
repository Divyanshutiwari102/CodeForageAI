package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.auth.AuthResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.auth.LoginRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.auth.SignupRequest;

public interface AuthService {
    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);
}
