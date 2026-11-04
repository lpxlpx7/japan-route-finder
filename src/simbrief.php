<?php
declare(strict_types=1);

/** SimBrief's dispatch page, prefilled from the query string (same names as the API: orig, dest, route, origrwy, destrwy). */
const SIMBRIEF_DISPATCH = 'https://dispatch.simbrief.com/options/custom';

/**
 * "KAIHO Y56 SPENS" with an arrival handoff at SPENS → "KAIHO Y56 SPENS/13000". Only the arrival side's
 * transfer altitudes are marked, and only at points that are in the route.
 */
function route_with_transfer_altitudes(string $route, array $transfers): string
{
    $tokens = preg_split('/\s+/', trim($route), -1, PREG_SPLIT_NO_EMPTY);
    if (!$tokens) {
        return '';
    }
    $altitudes = [];
    $response = $transfers['arr ' . end($tokens)] ?? null;
    foreach ($response && $response['ok'] ? ($response['data']['groups'] ?? []) : [] as $group) {
        foreach ($group['handoffs'] ?? [] as $handoff) {
            $point = strtoupper(trim((string) ($handoff['point'] ?? '')));
            $altitude = strtoupper((string) preg_replace('/\s+/', '', (string) ($handoff['altitude'] ?? '')));
            // The first table entry for a point wins.
            if ($point !== '' && $altitude !== '' && !isset($altitudes[$point])) {
                $altitudes[$point] = $altitude;
            }
        }
    }
    foreach ($tokens as $index => $token) {
        if (isset($altitudes[$token])) {
            $tokens[$index] = $token . '/' . $altitudes[$token];
        }
    }
    return implode(' ', $tokens);
}

/**
 * The runway in use, read from the ATIS text. Departure looks for "DEP RWY 34R" first, arrival for
 * "LDG RWY 34L" or "ILS Z RWY 34L APCH"; both then fall back to "USING RWY 16R", "RWY 16R IN USE" or the first runway named.
 */
function atis_runway(string $text, string $side): string
{
    $text = strtoupper((string) preg_replace('/\s+/', ' ', $text));
    $rwy = 'RWY|RUNWAY|RWYS|RUNWAYS';
    $id = '(0[1-9]|[12]\d|3[0-6])([LRC])?\b';
    $patterns = $side === 'dep'
        ? ["/\\b(?:DEP|DEPARTURE|DEPARTING|TKOF|TAKE ?OFF)S? (?:$rwy) $id/"]
        : ["/\\b(?:ARR|ARRIVAL|ARRIVING|LDG|LANDING)S? (?:$rwy) $id/",
            "/\\b(?:ILS|LOC|RNP|RNAV|VOR|NDB|LDA|GPS|VISUAL)(?: [A-Z])? (?:APCH |APPROACH )?(?:$rwy) $id/"];
    $patterns[] = "/\\b(?:USING|USE|IN USE) (?:$rwy) $id/";
    $patterns[] = "/\\b(?:$rwy) $id IN USE/";
    $patterns[] = "/\\b(?:$rwy) $id/";
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $text, $match)) {
            return $match[1] . ($match[2] ?? '');
        }
    }
    return '';
}

/** The route to send: published route number $index (from 0) as the cards list them, or the generated one. */
function simbrief_route(array $data, int $index): string
{
    if (($data['source'] ?? '') === 'aip') {
        return (string) ($data['aip_routes'][$index]['route'] ?? '');
    }
    return ($data['source'] ?? '') === 'generated' && $index === 0 ? (string) ($data['generated']['route'] ?? '') : '';
}

function simbrief_button(int $index): string
{
    return '<button class="copy-button simbrief-button" type="button" data-simbrief-route="' . $index . '">'
        . '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6m0-6-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>'
        . i18n('simbrief') . '</button>';
}

/** Link to SimBrief's dispatch page with airports, route (arrival transfer altitudes marked) and the ATIS runways. */
function simbrief_url(string $dep, string $arr, string $route, array $transfers, ?array $atis): string
{
    $params = ['orig' => $dep, 'dest' => $arr, 'route' => route_with_transfer_altitudes($route, $transfers)];
    foreach (['origrwy' => [$dep, 'dep'], 'destrwy' => [$arr, 'arr']] as $name => [$icao, $side]) {
        $text = (string) ($atis['items'][$icao]['atis']['text'] ?? '');
        $runway = $text !== '' ? atis_runway($text, $side) : '';
        if ($runway !== '') {
            $params[$name] = $runway;
        }
    }
    return SIMBRIEF_DISPATCH . '?' . http_build_query(array_filter($params, fn ($value) => $value !== ''));
}
