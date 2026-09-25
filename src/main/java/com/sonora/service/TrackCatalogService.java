package com.sonora.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

import com.sonora.adapters.TrackAdapter;
import com.sonora.domain.TrackDTO;

public final class TrackCatalogService {
    private final List<TrackDTO> tracks;

    public TrackCatalogService(List<TrackAdapter> adapters) {
        this.tracks = adapters.stream()
                .flatMap(adapter -> adapter.loadTracks().stream())
                .toList();
    }

    public List<TrackDTO> search(String searchTerm, String provider) {
        String normalizedTerm = searchTerm.toLowerCase(Locale.ROOT);
        Stream<TrackDTO> results = tracks.stream();
        if (!provider.equals("all")) {
            results = results.filter(track -> track.provider().equals(provider));
        }
        if (!normalizedTerm.isBlank()) {
            results = results.filter(track -> (track.title() + " " + track.artist() + " " + track.album())
                    .toLowerCase(Locale.ROOT).contains(normalizedTerm));
        }
        return results.toList();
    }

    public Optional<TrackDTO> findById(String id) {
        return tracks.stream().filter(track -> track.id().equals(id)).findFirst();
    }

    public List<String> providers() {
        return tracks.stream().map(TrackDTO::provider).distinct().sorted().toList();
    }
}