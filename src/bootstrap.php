<?php
declare(strict_types=1);

require_once __DIR__ . '/i18n.php';
require_once __DIR__ . '/results.php';
require_once __DIR__ . '/transfer.php';
require_once __DIR__ . '/layout.php';

function app_config(): array
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/../config.php';
        $config = (is_file($path) ? require $path : []) + [
            'api_base' => 'http://127.0.0.1:8080',
            'api_key' => '',
            'timeout' => 30,
        ];
        foreach (['api_base' => 'JURINA_API_BASE', 'api_key' => 'JURINA_API_KEY'] as $name => $variable) {
            $value = getenv($variable);
            if (is_string($value) && $value !== '') {
                $config[$name] = $value;
            }
        }
    }
    return $config;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function normalize_icao(string $value): string
{
    return substr((string) preg_replace('/[^A-Z]/', '', strtoupper($value)), 0, 4);
}

/**
 * Call Jurina API from the server, several requests at once. The key stays here.
 *
 * @param array<string|int, array{0: string, 1: array}> $requests path and query for each request
 * @return array<string|int, array{ok: bool, status: int, data: ?array}>
 */
function api_get_many(array $requests): array
{
    $config = app_config();
    $multi = curl_multi_init();
    $handles = [];
    foreach ($requests as $name => [$path, $params]) {
        $query = http_build_query(array_filter($params, fn ($value) => $value !== null && $value !== ''));
        $curl = curl_init(rtrim($config['api_base'], '/') . $path . ($query !== '' ? "?$query" : ''));
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => (int) $config['timeout'],
            CURLOPT_HTTPHEADER => ['X-API-Key: ' . $config['api_key'], 'Accept: application/json'],
        ]);
        curl_multi_add_handle($multi, $curl);
        $handles[$name] = $curl;
    }
    do {
        $status = curl_multi_exec($multi, $running);
        if ($running) {
            curl_multi_select($multi);
        }
    } while ($running && $status === CURLM_OK);

    $results = [];
    foreach ($handles as $name => $curl) {
        $body = curl_multi_getcontent($curl);
        $code = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $data = is_string($body) && $body !== '' ? json_decode($body, true) : null;
        if ($code === 0) {
            error_log('Jurina API request failed: ' . curl_error($curl));
        } elseif ($code >= 500 || $code === 401 || !is_array($data)) {
            error_log("Jurina API returned HTTP $code for {$requests[$name][0]}");
        }
        $results[$name] = ['ok' => $code === 200 && is_array($data), 'status' => $code, 'data' => is_array($data) ? $data : null];
        curl_multi_remove_handle($multi, $curl);
    }
    curl_multi_close($multi);
    return $results;
}

function fetch_route(string $dep, string $arr, string $eobt): array
{
    return api_get_many(['route' => ['/v1/japan-route/route', ['dep' => $dep, 'arr' => $arr, 'eobt' => $eobt]]])['route'];
}

/** Transfer table lookups, keyed "dep FIX" / "arr FIX" etc. Each value is [icao, side, fix]. */
function fetch_transfers(array $lookups): array
{
    $requests = [];
    foreach ($lookups as $name => [$icao, $side, $fix]) {
        $requests[$name] = ['/v1/japan-route/transfer', ['icao' => $icao, 'side' => $side, 'fix' => $fix]];
    }
    return $requests ? api_get_many($requests) : [];
}

/** "EOBT 2051-1339\n&ETA 2145-1344" → windows in UTC and JST. */
function time_windows(string $restriction): array
{
    preg_match_all('/(EOBT|ETA)\s*(\d{2})(\d{2})\s*-\s*(\d{2})(\d{2})/i', $restriction, $matches, PREG_SET_ORDER);
    $clock = fn (int $minutes) => sprintf('%02d:%02d', intdiv($minutes % 1440, 60), $minutes % 60);
    $windows = [];
    foreach ($matches as [, $kind, $h1, $m1, $h2, $m2]) {
        $start = (int) $h1 * 60 + (int) $m1;
        $end = (int) $h2 * 60 + (int) $m2;
        $windows[] = [strtoupper($kind), $clock($start) . '–' . $clock($end), $clock($start + 540) . '–' . $clock($end + 540)];
    }
    return $windows;
}
