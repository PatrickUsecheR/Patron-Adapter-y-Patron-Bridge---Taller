package com.sonora.api;

import java.util.List;
import java.util.StringJoiner;

import com.sonora.domain.TrackDTO;

public final class TrackJsonSerializer {
    public String serialize(TrackDTO track) {
        return new StringJoiner(",", "{", "}")
                .add(property("id", track.id()))
                .add(property("provider", track.provider()))
                .add(property("title", track.title()))
                .add(property("artist", track.artist()))
                .add(property("album", track.album()))
                .add("\"durationSeconds\":" + track.durationSeconds())
                .add(property("thumbnailUrl", track.thumbnailUrl()))
                .add(property("playbackUrl", track.playbackUrl()))
                .add(property("embedUrl", track.embedUrl()))
                .toString();
    }

    public String serialize(List<TrackDTO> tracks) {
        return tracks.stream().map(this::serialize).collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }

    public String serializeStrings(List<String> values) {
        return values.stream().map(this::quote).collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }

    public String serializeError(String message) {
        return "{" + property("error", message) + "}";
    }

    private String property(String name, String value) {
        return quote(name) + ":" + quote(value);
    }

    private String quote(String value) {
        StringBuilder escaped = new StringBuilder(value.length() + 2).append('"');
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            switch (character) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (character < 0x20) escaped.append(String.format("\\u%04x", (int) character));
                    else escaped.append(character);
                }
            }
        }
        return escaped.append('"').toString();
    }
}