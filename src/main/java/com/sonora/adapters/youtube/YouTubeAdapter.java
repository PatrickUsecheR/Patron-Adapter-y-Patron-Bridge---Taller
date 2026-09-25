package com.sonora.adapters.youtube;

import java.time.Duration;
import java.util.List;

import com.sonora.adapters.TrackAdapter;
import com.sonora.domain.TrackDTO;

public final class YouTubeAdapter implements TrackAdapter {
    private record VideoItem(String videoId, String title, String channelTitle, String thumbnailUrl,
            String duration) {}

    @Override
    public List<TrackDTO> loadTracks() {
        List<VideoItem> response = List.of(
                new VideoItem("jfKfPfyJRdk", "lofi hip hop radio", "Lofi Girl",
                        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=85", "PT0S"),
                new VideoItem("M7lc1UVf-VE", "IFrame Player API Demo", "YouTube Developers",
                        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=85", "PT3M33S"));

        return response.stream().map(video -> new TrackDTO(
                video.videoId(), "youtube", video.title(), video.channelTitle(), "YouTube",
                (int) Duration.parse(video.duration()).getSeconds(), video.thumbnailUrl(), "",
                "https://www.youtube.com/embed/" + video.videoId())).toList();
    }
}