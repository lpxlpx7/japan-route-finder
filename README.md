# Japan Route Finder

Look up IFR routes between airports in Japan. If the AIP publishes a route for the pair, the site shows it. If it doesn't, it shows a reference route generated from NavData.

The routes come from [Jurina API](https://api.jurina.org) (`/v1/japan-route/route`). The PHP page calls the API from the server, so the API key never reaches the browser.

Turn on "Transfer altitudes" to also get the ATC handoff points and altitudes (`/v1/japan-route/transfer`) for each route's first and last fix. `transfer.php` looks them up on their own: enter an airport, pick arrival or departure, and choose a fix from the list, or leave it on "All fixes".

Below the results there's a map of the route. The page draws it with Leaflet from the `geometry` coordinates in the API response. The API's own signed `map_url` and `map.png` aren't used, so the browser never sees the API's address, a signed link or the key.

## Requirements

- PHP 8.1 or later with the `curl` extension
- Jurina API running on the same server (by default the Docker container on `127.0.0.1:8080`)

## Setup

```bash
cp config.example.php config.php
nano config.php
```

Set `api_key` to one of the keys in the API's `API_KEYS` (the part after `web:`, for example). `api_base` defaults to `http://127.0.0.1:8080`, which reaches the container directly without going out to the internet. You can also set `JURINA_API_BASE` and `JURINA_API_KEY` as environment variables instead.

`config.php` and `src/` must not be served. The included `.htaccess` handles that on Apache. On nginx with PHP-FPM:

```nginx
server {
    server_name jprt.lpxlpx7.top;
    root /var/www/japan-route-finder;
    index index.php;

    location ~ ^/(src/|config(\.example)?\.php|README\.md) { return 404; }
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }
}
```

To try it locally:

```bash
php -S 127.0.0.1:8090
```

## Files

```text
index.php            route search, and ?partial=1 for in-page searches
transfer.php         transfer altitudes by airport, side and fix
src/bootstrap.php    config and the API requests (run in parallel)
src/layout.php       shared head, nav, footer and the iOS switch
src/results.php      route cards and the map's embedded coordinates
src/transfer.php     transfer altitude tables
src/i18n.php         English and Japanese text
assets/js/common.js  language, theme, copy
assets/js/app.js     route search page
assets/js/transfer.js transfer page
assets/js/map.js     route map
assets/vendor/       Leaflet 1.9.4
fonts/               SF Pro (en/pro) and GenShin Gothic (jp), as on jurina.org
assets/              CSS and icons
```

The look follows [jurina.org](https://www.jurina.org/): same colors, fonts, light/dark theme and EN/日本語 switch.

## Attribution

The route search started in Kevin's [Japan Flight Dispatcher](https://github.com/kevin-git-2026/japan-flight-dispatcher). Thanks to Kevin for the original app. The upstream project doesn't declare a license, so no rights to its code are granted here.

Published routes come from [jp-routes](https://jp-routes.vercel.app/). Generated routes use X-Plane NavData from Navigraph and are only for flight simulation.

The map uses [Leaflet](https://leafletjs.com/) (BSD-2-Clause, see `assets/vendor/leaflet/LICENSE`) with tiles from GSI (地理院タイル), OpenStreetMap and Esri.

Icons are [Ionicons](https://ionic.io/ionicons) (MIT, see `assets/icons/LICENSE-ionicons.txt`).

## License

The code in this repository is licensed under [GPL-2.0-only](LICENSE). It doesn't relicense Kevin's project or any third-party data.

For flight simulation only. Don't use it for real-world navigation.
