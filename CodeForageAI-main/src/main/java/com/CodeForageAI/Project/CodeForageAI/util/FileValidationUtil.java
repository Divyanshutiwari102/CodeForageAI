package com.CodeForageAI.Project.CodeForageAI.util;

import java.util.Set;

public final class FileValidationUtil {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/json",
            "application/javascript",
            "application/xml",
            "application/yaml"
    );

    private FileValidationUtil() {
    }

    public static boolean isAllowedContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return false;
        }
        String base = contentType.contains(";")
                ? contentType.substring(0, contentType.indexOf(';')).trim()
                : contentType.trim();
        return base.startsWith("text/") || ALLOWED_CONTENT_TYPES.contains(base);
    }
}
