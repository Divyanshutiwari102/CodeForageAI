package com.CodeForageAI.Project.CodeForageAI.util;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CodeBlockParserTest {

    @Test
    void parse_filtersUnsafePathTraversal() {
        String input = """
                ```js
                // ../secrets.txt
                console.log('x')
                ```
                """;

        List<CodeBlockParser.ParsedFile> parsed = CodeBlockParser.parse(input);

        assertTrue(parsed.isEmpty());
    }

    @Test
    void parse_acceptsSafePath() {
        String input = """
                ```jsx
                // src/components/App.jsx
                export default function App() { return null; }
                ```
                """;

        List<CodeBlockParser.ParsedFile> parsed = CodeBlockParser.parse(input);

        assertEquals(1, parsed.size());
        assertEquals("src/components/App.jsx", parsed.getFirst().path());
    }
}
