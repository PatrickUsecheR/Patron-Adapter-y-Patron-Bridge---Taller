package com.sonora.adapters.local;

import java.util.List;

import com.sonora.adapters.TrackAdapter;
import com.sonora.domain.TrackDTO;

public final class LocalFileAdapter implements TrackAdapter {
    private record LocalMedia(String relativePath, String displayName, String artistName, String collection,
            int lengthSeconds, String coverUrl) {}

    @Override
    public List<TrackDTO> loadTracks() {
        List<LocalMedia> files = List.of(
                new LocalMedia("/media/summer-night.mp3", "Summer Night", "Studio Sessions", "Local Library", 198,
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=85"),
                new LocalMedia("/media/quiet-morning.mp3", "Quiet Morning", "Ambient Works", "Local Library", 241,
                        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=85"));

        return files.stream().map(file -> new TrackDTO(
                file.relativePath(), "local", file.displayName(), file.artistName(), file.collection(),
                file.lengthSeconds(), file.coverUrl(),
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "")).toList();
    }
}