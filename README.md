# Sonora: reproductor multimedia multicanal

Demo full-stack sin dependencias externas de Java. El backend usa `HttpServer` de Java 21 y sirve tanto la API REST como la interfaz web.

## Requisitos

- JDK 21 o posterior.
- Node.js 18 o posterior para ejecutar las comprobaciones automatizadas.

## Ejecutar

Desde la raíz del proyecto, compila y arranca el servidor.

PowerShell:

```powershell
New-Item -ItemType Directory -Force bin | Out-Null
$javaFiles = Get-ChildItem src/main/java -Recurse -Filter *.java | ForEach-Object FullName
javac -d bin $javaFiles
java -cp bin com.sonora.Main
```

Linux/macOS:

```sh
mkdir -p bin
javac -d bin $(find src/main/java -name '*.java' -print)
java -cp bin com.sonora.Main
```

Abre <http://localhost:8080>. Para cambiar el puerto, define la variable de entorno `PORT` antes de iniciar Java.

## Comprobaciones

Ejecuta las pruebas unitarias del Bridge, las comprobaciones sintácticas de todos los módulos ES y la prueba de humo del servidor:

```powershell
npm test
```

GitHub Actions ejecuta estos pasos al subir cambios y al abrir pull requests. No hace falta instalar paquetes npm: `package.json` declara módulos ES y scripts, pero no dependencias.

## API REST

- `GET /api/health`: estado del servidor.
- `GET /api/providers`: proveedores conocidos.
- `GET /api/tracks`: catálogo unificado.
- `GET /api/tracks?q=bright&provider=spotify`: búsqueda y filtro por proveedor.
- `GET /api/tracks/{id}`: detalle de una pista.

Los adaptadores Java convierten estructuras distintas (`VideoItem`, `SpotifyTrack` y `LocalMedia`) a `TrackDTO`. El frontend trabaja solo con ese contrato. El serializador JSON y el servidor HTTP están separados para que el modelo de dominio no dependa de la capa de transporte.

## Estructura

```text
src/main/java/com/sonora/
	adapters/          Adaptadores de proveedor
	api/               Handler REST, serializador y respuestas
	domain/            DTOs
	server/            Servidor y archivos estáticos
	service/           Catálogo y búsqueda
	Main.java          Composition root
web/js/
	*Engine.js         Implementaciones del Bridge
	*PlayerView.js     Abstracciones visuales
	*Adapter.js        Adaptación de eventos de proveedor
	*Factory.js        Creación de vistas y motores
	PlayerApplication.js
	TrackApiClient.js
	TrackLibraryView.js
```

El navegador organiza la aplicación en módulos ES: `PlayerApplication` coordina los componentes; los controles se envían a través de `PlayerView`, que delega al `PlaybackEngine` inyectado. La única función de entrada estática es `Main.main`; el resto de la lógica vive en objetos con responsabilidades definidas.

## Patrones

- **Adapter, backend:** `YouTubeAdapter`, `SpotifyAdapter` y `LocalFileAdapter` normalizan los modelos nativos de proveedor.
- **Adapter, frontend:** `PlaybackStateAdapter` convierte eventos de HTML5 Audio, YouTube IFrame API y Spotify Embed API al estado de reproducción común.
- **Bridge, frontend:** `MiniPlayerView`, `FullPlayerView` y `SidebarWidget` componen un `PlaybackEngine`; play/pause, seek y volumen se delegan desde la vista a la implementación concreta.

Cambiar Mini, Full o Widget conserva el motor y su estado actual. Las pistas locales usan HTML5 Audio; las de YouTube y Spotify usan sus reproductores web oficiales.

## Alcance de la demo

Los datos del backend son fixtures con forma representativa de las respuestas de cada proveedor; no se realizan llamadas autenticadas a YouTube Data API o Spotify Web API. El reproductor web usa YouTube IFrame API y Spotify Embed API, por lo que la reproducción depende de la disponibilidad del contenido, la conectividad y las restricciones de inserción del proveedor. La pista local de ejemplo usa un MP3 público para permitir probar HTML5 Audio sin instalar medios.

Para producción, cada Adapter debe recibir su cliente autenticado (OAuth y secretos mantenidos exclusivamente en el servidor), mapear respuestas reales a `TrackDTO` y gestionar cuotas, errores y licencias. El Spotify Web Playback SDK requiere además autenticación de usuario y una cuenta Premium; la demo usa Embed API para no exigir esas credenciales.

## Publicación

El repositorio excluye artefactos Java, dependencias descargadas, logs y archivos `.env`; se compilan localmente y en CI. `.vscode/settings.json` define el source root Java y se conserva para que VS Code reconozca el proyecto. Antes de publicar el proyecto como software de código abierto, elige una licencia y añade el archivo correspondiente: no se ha asumido una licencia en este repositorio.
