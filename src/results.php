<?php
declare(strict_types=1);

function copy_button(string $route): string
{
    return '<button class="copy-button" type="button" data-copy="' . e($route) . '">'
        . '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>'
        . i18n('copy') . '</button>';
}

function meta_item(string $labelKey, string $value): string
{
    return '<div class="meta-item"><dt>' . i18n($labelKey) . '</dt><dd>'
        . ($value !== '' ? nl2br(e($value)) : i18n('none')) . '</dd></div>';
}

function time_meta(string $restriction): string
{
    $windows = time_windows($restriction);
    if (!$windows) {
        return meta_item('time', $restriction);
    }
    $lines = '';
    foreach ($windows as [$kind, $utc, $jst]) {
        $lines .= '<span class="time-window"><b>' . e($kind) . '</b> ' . e($utc) . ' UTC <small>' . e($jst) . ' JST</small></span>';
    }
    return '<div class="meta-item meta-time"><dt>' . i18n('time') . '</dt><dd>' . $lines . '</dd></div>';
}

function option_list(string $labelKey, string $fix, array $options): string
{
    if (!$options) {
        return '';
    }
    $items = implode('', array_map(fn ($option) => '<li>' . e($option) . '</li>', $options));
    return '<div class="option-group"><h4>' . i18n($labelKey, ['fix' => $fix]) . '</h4><ul>' . $items . '</ul></div>';
}

function map_button(int $index): string
{
    return '<button class="copy-button map-button" type="button" data-map-route="' . $index . '">'
        . '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13m6-10.5v13"/></svg>'
        . i18n('showOnMap') . '</button>';
}

/** Only coordinates go to the browser: no map_url, map_image_url or anything else that names the API. */
function map_geometry(?array $geometry): ?array
{
    if (!$geometry || empty($geometry['points']) || !isset($geometry['legs'])) {
        return null;
    }
    $points = [];
    foreach ($geometry['points'] as $point) {
        $points[] = [
            'ident' => (string) ($point['ident'] ?? ''),
            'region' => (string) ($point['region'] ?? ''),
            'lat' => (float) ($point['lat'] ?? 0),
            'lon' => (float) ($point['lon'] ?? 0),
            'kind' => (string) ($point['kind'] ?? 'fix'),
            'major' => (bool) ($point['major'] ?? false),
        ];
    }
    $legs = [];
    foreach ($geometry['legs'] as $leg) {
        $legs[] = ['from' => (int) ($leg['from'] ?? 0), 'to' => (int) ($leg['to'] ?? 0), 'airway' => (string) ($leg['airway'] ?? '')];
    }
    return ['points' => $points, 'legs' => $legs];
}

/**
 * Every point along the route in flying order, airway names left out: "KAIHO Y56 SPENS" → "KAIHO ONC SPENS".
 * Taken from the map geometry, so the airports and SID/STAR connections are dropped. Without geometry the
 * route string is returned as it is.
 */
function route_points(array $route): string
{
    $geometry = map_geometry($route['geometry'] ?? null);
    if ($geometry === null) {
        return (string) $route['route'];
    }
    $order = [];
    foreach ($geometry['legs'] as $leg) {
        foreach ([$leg['from'], $leg['to']] as $index) {
            if (end($order) !== $index) {
                $order[] = $index;
            }
        }
    }
    $idents = [];
    foreach ($order as $index) {
        $point = $geometry['points'][$index] ?? null;
        if ($point && $point['kind'] !== 'airport' && $point['ident'] !== '' && end($idents) !== $point['ident']) {
            $idents[] = $point['ident'];
        }
    }
    return $idents ? implode(' ', $idents) : (string) $route['route'];
}

/** The route as the card shows it: as published, or every point when "All waypoints" is on. */
function shown_route(array $route, bool $points): string
{
    return $points ? route_points($route) : (string) $route['route'];
}

/** The large map under the results. Drawn by assets/js/map.js from the embedded geometry. */
function map_panel(array $routes, bool $points = false): string
{
    $items = array_map(fn ($route) => ['route' => shown_route($route, $points), 'geometry' => map_geometry($route['geometry'] ?? null)], $routes);
    if (!array_filter($items, fn ($item) => $item['geometry'] !== null)) {
        return '';
    }
    $tabs = '';
    if (count($items) > 1) {
        foreach ($items as $index => $item) {
            $tabs .= '<button type="button" role="tab" data-map-route="' . $index . '" title="' . e($item['route']) . '" aria-selected="' . ($index === 0 ? 'true' : 'false') . '">'
                . i18n('routeNumber', ['n' => $index + 1]) . '</button>';
        }
        $tabs = '<div class="map-tabs" role="tablist" aria-label="' . e(t('mapRoutes')) . '" data-i18n-aria-label="mapRoutes">' . $tabs . '</div>';
    }
    $json = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    return '<section class="map-card" aria-labelledby="map-title"><div class="map-card-head">'
        . '<h3 id="map-title">' . i18n('mapTitle') . '</h3>' . $tabs
        . '<div class="map-toggles">' . switch_control('map-wp', 'mapWaypoints', true, ' data-map-toggle="wp"')
        . switch_control('map-awy', 'mapAirways', true, ' data-map-toggle="awy"') . '</div></div>'
        . '<div class="route-map" role="region" aria-label="' . e(t('mapTitle')) . '" data-i18n-aria-label="mapTitle"></div>'
        . '<p class="map-route-string"></p>'
        . i18n('mapHint', [], 'p', ' class="map-hint"')
        . '<script type="application/json" class="route-map-data">' . $json . '</script></section>';
}

function render_results(array $query, ?array $response, ?array $transfers = null, ?array $atis = null): string
{
    [$dep, $arr, $eobt] = [$query['dep'], $query['arr'], $query['eobt']];
    $pair = '<h2 class="result-pair">' . e($dep) . '<svg viewBox="0 0 40 16" aria-hidden="true"><path d="M2 8h34m-6-6 6 6-6 6"/></svg>' . e($arr) . '</h2>';
    $eobtBadge = $eobt !== '' ? '<span class="badge">' . i18n('eobtBadge', ['eobt' => $eobt]) . '</span>' : '';

    if ($response === null || !$response['ok']) {
        $code = $response['data']['error']['code'] ?? '';
        $key = ['invalid_icao' => 'errorInvalid', 'same_airport' => 'errorSame', 'invalid_eobt' => 'errorEobt'][$code] ?? 'errorService';
        return '<div class="result-head">' . $pair . '</div><div class="notice-card notice-error">' . i18n($key, [], 'p') . '</div>';
    }

    $data = $response['data'];
    $source = $data['source'] ?? 'none';
    $points = (bool) ($query['points'] ?? false);
    $pointsBadge = $points ? '<span class="badge">' . i18n('pointsBadge') . '</span>' : '';
    $atisBlock = $atis !== null ? render_atis_block($dep, $arr, $atis) : '';
    $footer = '<p class="data-line">' . i18n('dataCycles', ['navdata' => $data['navdata_cycle'] ?? '—', 'transfer' => $data['transfer_cycle'] ?? '—']) . '</p>';
    if (in_array($data['aip_data'] ?? '', ['stale', 'file'], true)) {
        $footer = '<p class="data-line">' . i18n('dataStale') . '</p>' . $footer;
    }

    if ($source === 'aip') {
        $routes = $data['aip_routes'] ?? [];
        $count = count($routes) === 1 ? i18n('routeCountOne') : i18n('routeCount', ['count' => count($routes)]);
        $html = '<div class="result-head"><p class="eyebrow">' . i18n('kickerAip') . '</p>' . $pair
            . '<div class="badges"><span class="badge">' . $count . '</span>' . $eobtBadge . $pointsBadge . '</div></div><div class="route-list">';
        foreach ($routes as $index => $route) {
            $shown = shown_route($route, $points);
            $html .= '<article class="route-card"><div class="route-card-head"><span class="route-number">'
                . i18n('routeNumber', ['n' => $index + 1]) . '</span><span class="card-actions">'
                . (isset($route['geometry']) ? map_button($index) : '') . copy_button($shown) . simbrief_button($index) . '</span></div>'
                . '<p class="route-string">' . e($shown) . '</p><dl class="route-meta">'
                . time_meta($route['time_restriction'] ?? '')
                . meta_item('altitude', $route['altitude'] ?? '')
                . meta_item('aircraft', $route['aircraft'] ?? '')
                . (($route['remarks'] ?? '') !== '' ? meta_item('remarks', $route['remarks']) : '')
                . '</dl>'
                . ($transfers !== null ? route_transfer_block($dep, $arr, $route['route'], $transfers) : '')
                . '</article>';
        }
        return $html . '</div>' . $footer . $atisBlock . map_panel($routes, $points);
    }

    if ($source === 'generated' && isset($data['generated'])) {
        $route = $data['generated'];
        $fixes = $route['fixes'] ?? [];
        $first = $fixes[0]['ident'] ?? '';
        $last = $fixes ? $fixes[count($fixes) - 1]['ident'] : '';
        $warnings = '';
        foreach ($route['warnings'] ?? [] as $warning) {
            $known = warning_key($warning);
            $warnings .= $known ? i18n($known[0], $known[1], 'li') : '<li>' . e($warning) . '</li>';
        }
        $shown = shown_route($route, $points);
        $methodKey = ($route['method'] ?? '') === 'direct' ? 'methodDirect' : 'methodAirway';
        return '<div class="result-head"><p class="eyebrow">' . i18n('kickerGenerated') . '</p>' . $pair
            . '<div class="badges">' . $eobtBadge . $pointsBadge . '</div></div>'
            . '<article class="route-card route-card-generated"><div class="route-card-head"><span class="route-number">'
            . i18n('generatedLabel') . '</span><span class="card-actions">'
            . (isset($route['geometry']) ? map_button(0) : '') . copy_button($shown) . simbrief_button(0) . '</span></div>'
            . '<p class="route-string">' . e($shown) . '</p>'
            . '<dl class="route-meta">'
            . '<div class="meta-item"><dt>' . i18n('distance') . '</dt><dd>' . e((string) round((float) ($route['distance_nm'] ?? 0))) . ' NM</dd></div>'
            . '<div class="meta-item"><dt>' . i18n('method') . '</dt><dd>' . i18n($methodKey) . '</dd></div>'
            . '</dl>'
            . '<div class="option-groups">'
            . option_list('sidOptions', $first, $route['sid_options'] ?? [])
            . option_list('starOptions', $last, $route['star_options'] ?? [])
            . option_list('approachOptions', $last, $route['approach_options'] ?? [])
            . '</div>'
            . ($warnings !== '' ? '<div class="route-notes"><h4>' . i18n('notes') . '</h4><ul>' . $warnings . '</ul></div>' : '')
            . ($transfers !== null ? route_transfer_block($dep, $arr, $route['route'], $transfers) : '')
            . i18n('generatedNote', [], 'p', ' class="route-scope"')
            . '</article>' . $footer . $atisBlock . map_panel([$route], $points);
    }

    if ($source === 'aip_time_mismatch') {
        return '<div class="result-head"><p class="eyebrow">' . i18n('kickerMismatch') . '</p>' . $pair
            . '<div class="badges">' . $eobtBadge . '</div></div><div class="notice-card">'
            . i18n('mismatchText', ['eobt' => $eobt], 'p') . i18n('mismatchHint', [], 'p', ' class="notice-hint"') . '</div>' . $footer . $atisBlock;
    }

    return '<div class="result-head"><p class="eyebrow">' . i18n('kickerNone') . '</p>' . $pair . '</div><div class="notice-card">'
        . i18n('noneText', ['dep' => $dep, 'arr' => $arr], 'p') . i18n('noneHint', [], 'p', ' class="notice-hint"') . '</div>' . $footer . $atisBlock;
}
