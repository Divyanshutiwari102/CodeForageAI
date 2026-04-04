package com.CodeForageAI.Project.CodeForageAI.dto.health;

public record ServiceStatus(String name, String status, String detail) {

    public static ServiceStatus up(String name) {
        return new ServiceStatus(name, "UP", null);
    }

    public static ServiceStatus down(String name, String detail) {
        return new ServiceStatus(name, "DOWN", detail);
    }
}
