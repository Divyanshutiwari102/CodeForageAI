package com.CodeForageAI.Project.CodeForageAI.util;

import org.slf4j.MDC;

import java.util.UUID;

public final class TraceContext {

    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String TRACE_ID_MDC_KEY = "traceId";
    public static final String TRACE_ID_OTEL_MDC_KEY = "trace_id";

    private TraceContext() {
    }

    public static String getOrCreate(String incomingTraceId) {
        if (incomingTraceId != null && !incomingTraceId.isBlank()) {
            return incomingTraceId.trim();
        }
        return UUID.randomUUID().toString();
    }

    public static void set(String traceId) {
        if (traceId != null && !traceId.isBlank()) {
            MDC.put(TRACE_ID_MDC_KEY, traceId);
            MDC.put(TRACE_ID_OTEL_MDC_KEY, traceId);
        }
    }

    public static String get() {
        return MDC.get(TRACE_ID_MDC_KEY);
    }

    public static void clear() {
        MDC.remove(TRACE_ID_MDC_KEY);
        MDC.remove(TRACE_ID_OTEL_MDC_KEY);
    }
}
