package com.sonora.server;

import com.sonora.api.TrackApiHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public final class PlayerServer {
    private final HttpServer server;

    public PlayerServer(InetSocketAddress address, TrackApiHandler apiHandler,
            StaticAssetHandler assetHandler) throws IOException {
        server = HttpServer.create(address, 0);
        server.createContext("/api/", apiHandler);
        server.createContext("/", assetHandler);
    }

    public void start() {
        server.start();
    }

    public int port() {
        return server.getAddress().getPort();
    }

    public void stop() {
        server.stop(0);
    }
}