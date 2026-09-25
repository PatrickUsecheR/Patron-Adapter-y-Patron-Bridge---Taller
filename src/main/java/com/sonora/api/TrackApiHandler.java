package com.sonora.api;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

import com.sonora.domain.TrackDTO;
import com.sonora.service.TrackCatalogService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public final class TrackApiHandler implements HttpHandler {
    private final TrackCatalogService catalog;
    private final TrackJsonSerializer serializer;
    private final HttpResponseWriter responseWriter;

    public TrackApiHandler(TrackCatalogService catalog, TrackJsonSerializer serializer,
            HttpResponseWriter responseWriter) {
        this.catalog = catalog;
        this.serializer = serializer;
        this.responseWriter = responseWriter;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try (exchange) {
            if (!exchange.getRequestMethod().equals("GET")) {
                responseWriter.sendJson(exchange, 405, serializer.serializeError("Method not allowed"));
                return;
            }

            String path = exchange.getRequestURI().getPath();
            if (path.equals("/api/health")) {
                responseWriter.sendJson(exchange, 200, "{\"status\":\"ok\"}");
            } else if (path.equals("/api/providers")) {
                responseWriter.sendJson(exchange, 200, serializer.serializeStrings(catalog.providers()));
            } else if (path.equals("/api/tracks")) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
                responseWriter.sendJson(exchange, 200, serializer.serialize(catalog.search(
                        query.getOrDefault("q", ""), query.getOrDefault("provider", "all"))));
            } else if (path.startsWith("/api/tracks/")) {
                String id = path.substring("/api/tracks/".length());
                TrackDTO track = catalog.findById(id).orElse(null);
                if (track == null) {
                    responseWriter.sendJson(exchange, 404, serializer.serializeError("Track not found"));
                } else {
                    responseWriter.sendJson(exchange, 200, serializer.serialize(track));
                }
            } else {
                responseWriter.sendJson(exchange, 404, serializer.serializeError("Route not found"));
            }
        }
    }

    private Map<String, String> parseQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) return Map.of();
        return Arrays.stream(rawQuery.split("&"))
                .map(part -> part.split("=", 2))
                .collect(Collectors.toMap(
                        pair -> URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                        pair -> pair.length > 1 ? URLDecoder.decode(pair[1], StandardCharsets.UTF_8) : "",
                        (first, second) -> second));
    }
}