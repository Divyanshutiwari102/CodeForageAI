package com.CodeForageAI.Project.CodeForageAI.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CodeBlockParser {

    // Matches code fences with an optional language tag, followed by an optional
    // first-line path comment:
    //   ```jsx
    //   // src/App.jsx
    //   ... code ...
    //   ```
    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile(
            "```(?:\\w+)?\\n(?://\\s*([^\\n]+)\\n)([\\s\\S]*?)```",
            Pattern.MULTILINE
    );

    // Extracts a file path from the comment line, supporting formats like:
    //   // src/App.jsx
    //   // filepath: src/App.jsx
    //   // file: src/App.jsx
    private static final Pattern FILEPATH_PATTERN = Pattern.compile(
            "(?:filepath:|file:)?\\s*([\\w./\\-]+\\.\\w+)"
    );

    public record ParsedFile(String path, String content) {}

    public static List<ParsedFile> parse(String llmResponse) {
        List<ParsedFile> files = new ArrayList<>();
        Matcher matcher = CODE_BLOCK_PATTERN.matcher(llmResponse);

        while (matcher.find()) {
            String pathComment = matcher.group(1);
            String code = matcher.group(2).trim();

            if (pathComment != null) {
                Matcher pathMatcher = FILEPATH_PATTERN.matcher(pathComment);
                if (pathMatcher.find()) {
                    String path = pathMatcher.group(1).trim();
                    if (path.startsWith("/")) {
                        path = path.substring(1);
                    }
                    files.add(new ParsedFile(path, code));
                }
            }
        }
        return files;
    }

    private CodeBlockParser() {
        // utility class
    }
}
