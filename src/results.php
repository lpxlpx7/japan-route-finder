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

function render_results(array $query, ?array $response): string
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
    $footer = '<p class="data-line">' . i18n('dataCycles', ['navdata' => $data['navdata_cycle'] ?? '—', 'transfer' => $data['transfer_cycle'] ?? '—']) . '</p>';
    if (in_array($data['aip_data'] ?? '', ['stale', 'file'], true)) {
        $footer = '<p class="data-line">' . i18n('dataStale') . '</p>' . $footer;
    }

    if ($source === 'aip') {
        $routes = $data['aip_routes'] ?? [];
        $count = count($routes) === 1 ? i18n('routeCountOne') : i18n('routeCount', ['count' => count($routes)]);
        $html = '<div class="result-head"><p class="eyebrow">' . i18n('kickerAip') . '</p>' . $pair
            . '<div class="badges"><span class="badge">' . $count . '</span>' . $eobtBadge . '</div></div><div class="route-list">';
        foreach ($routes as $index => $route) {
            $html .= '<article class="route-card"><div class="route-card-head"><span class="route-number">'
                . i18n('routeNumber', ['n' => $index + 1]) . '</span>' . copy_button($route['route']) . '</div>'
                . '<p class="route-string">' . e($route['route']) . '</p><dl class="route-meta">'
                . time_meta($route['time_restriction'] ?? '')
                . meta_item('altitude', $route['altitude'] ?? '')
                . meta_item('aircraft', $route['aircraft'] ?? '')
                . (($route['remarks'] ?? '') !== '' ? meta_item('remarks', $route['remarks']) : '')
                . '</dl></article>';
        }
        return $html . '</div>' . $footer;
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
        $methodKey = ($route['method'] ?? '') === 'direct' ? 'methodDirect' : 'methodAirway';
        return '<div class="result-head"><p class="eyebrow">' . i18n('kickerGenerated') . '</p>' . $pair
            . '<div class="badges">' . $eobtBadge . '</div></div>'
            . '<article class="route-card route-card-generated"><div class="route-card-head"><span class="route-number">'
            . i18n('generatedLabel') . '</span>' . copy_button($route['route']) . '</div>'
            . '<p class="route-string">' . e($route['route']) . '</p>'
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
            . i18n('generatedNote', [], 'p', ' class="route-scope"')
            . '</article>' . $footer;
    }

    if ($source === 'aip_time_mismatch') {
        return '<div class="result-head"><p class="eyebrow">' . i18n('kickerMismatch') . '</p>' . $pair
            . '<div class="badges">' . $eobtBadge . '</div></div><div class="notice-card">'
            . i18n('mismatchText', ['eobt' => $eobt], 'p') . i18n('mismatchHint', [], 'p', ' class="notice-hint"') . '</div>' . $footer;
    }

    return '<div class="result-head"><p class="eyebrow">' . i18n('kickerNone') . '</p>' . $pair . '</div><div class="notice-card">'
        . i18n('noneText', ['dep' => $dep, 'arr' => $arr], 'p') . i18n('noneHint', [], 'p', ' class="notice-hint"') . '</div>' . $footer;
}
