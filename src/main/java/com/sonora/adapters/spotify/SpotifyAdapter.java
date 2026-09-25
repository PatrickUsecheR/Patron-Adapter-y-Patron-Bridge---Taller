package com.sonora.adapters.spotify;

import com.sonora.adapters.TrackAdapter;
import com.sonora.domain.TrackDTO;
import java.util.List;

public final class SpotifyAdapter implements TrackAdapter {
    private record Album(String name, String imageUrl) {}
    private record SpotifyTrack(String id, String name, List<String> artists, Album album,
            int durationMs, boolean explicit) {}

    @Override
    public List<TrackDTO> loadTracks() {
        List<SpotifyTrack> response = List.of(
                new SpotifyTrack("4uLU6hMCjMI75M1A2tKUQC", "Never Gonna Give You Up",
                        List.of("Rick Astley"), new Album("Whenever You Need Somebody",
                        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=85"), 213000, false),
                new SpotifyTrack("3n3Ppam7vgaVa1iaRUc9Lp", "Mr. Brightside", List.of("The Killers"),
                        new Album("Hot Fuss",
                        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=85"), 222000, false));

        return response.stream().map(track -> new TrackDTO(
                track.id(), "spotify", track.name(), String.join(", ", track.artists()), track.album().name(),
                track.durationMs() / 1000, track.album().imageUrl(), "",
                "https://open.spotify.com/embed/track/" + track.id())).toList();
    }
}