package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.config.QdrantConfig;
import com.CodeForageAI.Project.CodeForageAI.service.EmbeddingService;
import com.CodeForageAI.Project.CodeForageAI.service.RagService;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.grpc.Collections.Distance;
import io.qdrant.client.grpc.Collections.VectorParams;
import io.qdrant.client.grpc.Points.Condition;
import io.qdrant.client.grpc.Points.FieldCondition;
import io.qdrant.client.grpc.Points.Filter;
import io.qdrant.client.grpc.Points.Match;
import io.qdrant.client.grpc.Points.PointStruct;
import io.qdrant.client.grpc.Points.ScoredPoint;
import io.qdrant.client.grpc.Points.SearchPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static io.qdrant.client.PointIdFactory.id;
import static io.qdrant.client.ValueFactory.value;
import static io.qdrant.client.VectorsFactory.vectors;
import static io.qdrant.client.WithPayloadSelectorFactory.enable;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagServiceImpl implements RagService {

    private final QdrantClient qdrantClient;
    private final EmbeddingService embeddingService;
    private final QdrantConfig qdrantConfig;

    private static final int VECTOR_SIZE = 1536;

    @Override
    public void indexFile(Long projectId, String filePath, String content) {
        try {
            ensureCollectionExists();

            List<Float> embedding = embeddingService.embed(
                    "File: " + filePath + "\n\n" + content
            );

            // Deterministic UUID so re-uploading the same file upserts the existing point
            UUID pointId = UUID.nameUUIDFromBytes(
                    (projectId + ":" + filePath).getBytes(StandardCharsets.UTF_8)
            );

            PointStruct point = PointStruct.newBuilder()
                    .setId(id(pointId))
                    .setVectors(vectors(embedding))
                    .putPayload("projectId", value(projectId))
                    .putPayload("filePath", value(filePath))
                    .build();

            qdrantClient.upsertAsync(qdrantConfig.getCollectionName(), List.of(point)).get();
            log.info("Indexed file {} for project {}", filePath, projectId);

        } catch (Exception e) {
            log.error("Error indexing file {} for project {}", filePath, projectId, e);
            throw new RuntimeException("Failed to index file", e);
        }
    }

    @Override
    public List<String> searchRelevantFiles(Long projectId, String prompt, int topK) {
        try {
            ensureCollectionExists();

            List<Float> queryEmbedding = embeddingService.embed(prompt);

            Filter filter = Filter.newBuilder()
                    .addMust(Condition.newBuilder()
                            .setField(FieldCondition.newBuilder()
                                    .setKey("projectId")
                                    .setMatch(Match.newBuilder()
                                            .setInteger(projectId)
                                            .build())
                                    .build())
                            .build())
                    .build();

            List<ScoredPoint> results = qdrantClient.searchAsync(
                    SearchPoints.newBuilder()
                            .setCollectionName(qdrantConfig.getCollectionName())
                            .addAllVector(queryEmbedding)
                            .setLimit(topK)
                            .setFilter(filter)
                            .setWithPayload(enable(true))
                            .build()
            ).get();

            return results.stream()
                    .map(sp -> sp.getPayload().get("filePath").getStringValue())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error searching relevant files for project {}", projectId, e);
            return List.of();
        }
    }

    @Override
    public void deleteProjectIndex(Long projectId) {
        try {
            Filter filter = Filter.newBuilder()
                    .addMust(Condition.newBuilder()
                            .setField(FieldCondition.newBuilder()
                                    .setKey("projectId")
                                    .setMatch(Match.newBuilder()
                                            .setInteger(projectId)
                                            .build())
                                    .build())
                            .build())
                    .build();

            qdrantClient.deleteAsync(qdrantConfig.getCollectionName(), filter).get();
            log.info("Deleted Qdrant index for project {}", projectId);

        } catch (Exception e) {
            log.error("Error deleting index for project {}", projectId, e);
        }
    }

    private void ensureCollectionExists() throws Exception {
        boolean exists = qdrantClient.collectionExistsAsync(
                qdrantConfig.getCollectionName()).get();

        if (!exists) {
            qdrantClient.createCollectionAsync(
                    qdrantConfig.getCollectionName(),
                    VectorParams.newBuilder()
                            .setSize(VECTOR_SIZE)
                            .setDistance(Distance.Cosine)
                            .build()
            ).get();
            log.info("Created Qdrant collection: {}", qdrantConfig.getCollectionName());
        }
    }
}
