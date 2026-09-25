package com.sonora.domain;

import java.util.Objects;

public record TrackDTO(
        String id,
        String provider,
        String title,
        String artist,
        String album,
        int durationSeconds,
        String thumbnailUrl,
        String playbackUrl,
        String embedUrl) {

    public TrackDTO {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(provider, "provider");
        Objects.requireNonNull(title, "title");
        Objects.requireNonNull(artist, "artist");
        Objects.requireNonNull(album, "album");
        Objects.requireNonNull(thumbnailUrl, "thumbnailUrl");
        Objects.requireNonNull(playbackUrl, "playbackUrl");
        Objects.requireNonNull(embedUrl, "embedUrl");
        if (durationSeconds < 0) throw new IllegalArgumentException("durationSeconds cannot be negative");
    }
}