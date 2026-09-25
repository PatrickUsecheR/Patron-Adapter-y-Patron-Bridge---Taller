package com.sonora;

import com.sonora.adapters.TrackAdapter;
import com.sonora.adapters.local.LocalFileAdapter;
import com.sonora.adapters.spotify.SpotifyAdapter;
import com.sonora.adapters.youtube.YouTubeAdapter;
import com.sonora.api.HttpResponseWriter;
import com.sonora.api.TrackApiHandler;
import com.sonora.api.TrackJsonSerializer;
import com.sonora.server.PlayerServer;
import com.sonora.server.StaticAssetHandler;
import com.sonora.service.TrackCatalogService;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Path;
import java.util.List;

public final class Main {
    private Main() {}

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        List<TrackAdapter> adapters = List.of(
                new YouTubeAdapter(), new SpotifyAdapter(), new LocalFileAdapter());
        TrackCatalogService catalog = new TrackCatalogService(adapters);
        TrackApiHandler apiHandler = new TrackApiHandler(
                catalog, new TrackJsonSerializer(), new HttpResponseWriter());
        PlayerServer server = new PlayerServer(
                new InetSocketAddress(port), apiHandler, new StaticAssetHandler(Path.of("web")));

        server.start();
        Runtime.getRuntime().addShutdownHook(new Thread(server::stop, "sonora-http-shutdown"));
        System.out.printf("Multichannel Player running at http://localhost:%d%n", server.port());
    }
}