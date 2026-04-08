package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {

    @Query("SELECT COALESCE(SUM(u.tokensUsed), 0) FROM UsageLog u " +
           "WHERE u.user.id = :userId AND u.createdAt >= :since")
    long sumTokensForUserSince(@Param("userId") Long userId,
                               @Param("since") Instant since);
}
