package com.CodeForageAI.Project.CodeForageAI.service;

import java.util.List;

public interface EmbeddingService {

    List<Float> embed(String text);
}
