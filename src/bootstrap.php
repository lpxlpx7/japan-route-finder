<?php
declare(strict_types=1);

require_once __DIR__ . '/i18n.php';
require_once __DIR__ . '/results.php';

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
 * Ask Jurina API for a route. The key stays on the server.
 *
 * @return array{ok: bool, status: int, data: ?array}
 */
function fetch_route(string $dep, string $arr, string $eobt): array
{
    $config = app_config();
    $query = http_build_query(array_filter(['dep' => $dep, 'arr' => $arr, 'eobt' => $eobt], 'strlen'));
    $curl = curl_init(rtrim($config['api_base'], '/') . '/v1/japan-route/route?' . $query);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => (int) $config['timeout'],
        CURLOPT_HTTPHEADER => ['X-API-Key: ' . $config['api_key'], 'Accept: application/json'],
    ]);
    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    if (!is_string($body)) {
        error_log('Jurina API request failed: ' . curl_error($curl));
        return ['ok' => false, 'status' => 0, 'data' => null];
    }
    $data = json_decode($body, true);
    if ($status >= 500 || $status === 401 || !is_array($data)) {
        error_log("Jurina API returned HTTP $status");
    }
    return ['ok' => $status === 200 && is_array($data), 'status' => $status, 'data' => is_array($data) ? $data : null];
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
