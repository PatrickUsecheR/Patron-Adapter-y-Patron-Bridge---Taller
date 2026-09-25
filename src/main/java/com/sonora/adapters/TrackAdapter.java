package com.sonora.adapters;

import java.util.List;

import com.sonora.domain.TrackDTO;

public interface TrackAdapter {
    List<TrackDTO> loadTracks();
}