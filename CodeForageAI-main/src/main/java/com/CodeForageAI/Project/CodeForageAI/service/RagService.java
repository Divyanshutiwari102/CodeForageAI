package com.CodeForageAI.Project.CodeForageAI.service;

import java.util.List;

public interface RagService {

    void indexFile(Long projectId, String filePath, String content);

    List<String> searchRelevantFiles(Long projectId, String prompt, int topK);

    void deleteProjectIndex(Long projectId);
}
