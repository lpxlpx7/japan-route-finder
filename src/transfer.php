<?php
declare(strict_types=1);

/** Fixes named in the group titles, which is what the API's fix filter matches. */
function transfer_fixes(array $groups): array
{
    $fixes = [];
    foreach ($groups as $group) {
        preg_match_all('/\b[A-Z][A-Z0-9]{1,6}\b/', (string) ($group['route'] ?? ''), $matches);
        foreach ($matches[0] as $token) {
            // Airway names (Y56, V17, B597...) aren't fixes.
            if (!preg_match('/^[A-Z]{1,2}\d{1,3}[A-Z]?$/', $token)) {
                $fixes[$token] = true;
            }
        }
    }
    $fixes = array_map('strval', array_keys($fixes));
    sort($fixes, SORT_STRING);
    return $fixes;
}

function transfer_table(array $handoffs, bool $withSource = true): string
{
    $head = '<tr><th>' . i18n('transferPoint') . '</th><th>' . i18n('transferAltitude') . '</th><th>' . i18n('transferFrom')
        . '</th><th>' . i18n('transferTo') . '</th>' . ($withSource ? '<th>' . i18n('transferSource') . '</th>' : '') . '</tr>';
    $rows = '';
    foreach ($handoffs as $handoff) {
        $cell = fn (string $key, string $class = '') => '<td' . ($class ? " class=\"$class\"" : '') . '>' . e($handoff[$key] ?? '') . '</td>';
        $rows .= '<tr>' . $cell('point', 'mono') . $cell('altitude', 'mono strong') . $cell('from') . $cell('to')
            . ($withSource ? $cell('source', 'muted') : '') . '</tr>';
    }
    return '<div class="table-scroll"><table class="transfer-table"><thead>' . $head . '</thead><tbody>' . $rows . '</tbody></table></div>';
}

function transfer_groups(array $groups, bool $withSource = true): string
{
    $html = '';
    foreach ($groups as $group) {
        $title = (string) ($group['route'] ?? '');
        $html .= '<div class="transfer-group"><p class="transfer-route">' . ($title !== '' ? e($title) : i18n('transferGeneral')) . '</p>'
            . transfer_table($group['handoffs'] ?? [], $withSource) . '</div>';
    }
    return $html;
}

/** Why a transfer lookup came back empty, as a translated sentence. */
function transfer_problem(?array $response, string $icao, string $side, string $fix): string
{
    $code = $response['data']['error']['code'] ?? '';
    if ($code === 'airport_not_found') {
        return i18n('transferNoAirport', ['icao' => $icao], 'p', ' class="transfer-empty"');
    }
    if ($code === 'fix_not_found') {
        return i18n($side === 'dep' ? 'transferNoFixDep' : 'transferNoFixArr', ['icao' => $icao, 'fix' => $fix], 'p', ' class="transfer-empty"');
    }
    return i18n('transferError', [], 'p', ' class="transfer-empty"');
}

/** The transfer section inside a route card: departure side for the first fix, arrival side for the last. */
function route_transfer_block(string $dep, string $arr, string $route, array $transfers): string
{
    $tokens = preg_split('/\s+/', trim($route), -1, PREG_SPLIT_NO_EMPTY);
    if (!$tokens) {
        return '';
    }
    $sides = [['dep', $dep, $tokens[0], 'transferDepartureVia'], ['arr', $arr, end($tokens), 'transferArrivalVia']];
    $html = '';
    foreach ($sides as [$side, $icao, $fix, $titleKey]) {
        $response = $transfers["$side $fix"] ?? null;
        $body = $response && $response['ok'] && !empty($response['data']['groups'])
            ? transfer_groups($response['data']['groups'], false)
            : transfer_problem($response, $icao, $side, $fix);
        $html .= '<div class="transfer-side"><h4>' . i18n($titleKey, ['icao' => $icao, 'fix' => $fix]) . '</h4>' . $body . '</div>';
    }
    return '<div class="route-transfer"><h4 class="route-transfer-title">' . i18n('transferToggle') . '</h4><div class="transfer-sides">' . $html . '</div></div>';
}

/** Lookups needed for every route on the page. */
function route_transfer_lookups(string $dep, string $arr, array $routes): array
{
    $lookups = [];
    foreach ($routes as $route) {
        $tokens = preg_split('/\s+/', trim((string) $route), -1, PREG_SPLIT_NO_EMPTY);
        if (!$tokens) {
            continue;
        }
        foreach ([['dep', $dep, $tokens[0]], ['arr', $arr, end($tokens)]] as [$side, $icao, $fix]) {
            if (preg_match('/^[A-Z0-9]{2,7}$/', $fix)) {
                $lookups["$side $fix"] = [$icao, $side, $fix];
            }
        }
    }
    return $lookups;
}

/** Results on the transfer page. */
function render_transfer_page(string $icao, string $side, string $fix, ?array $response): string
{
    $sideKey = $side === 'dep' ? 'departure' : 'arrival';
    if (!$response || !$response['ok']) {
        return '<div class="result-head"><p class="eyebrow">' . i18n($sideKey) . '</p><h2 class="result-pair">' . e($icao) . '</h2></div>'
            . '<div class="notice-card">' . transfer_problem($response, $icao, $side, $fix) . '</div>';
    }
    $data = $response['data'];
    $groups = $data['groups'] ?? [];
    $badges = '';
    if (!empty($data['section'])) {
        $badges .= '<span class="badge">' . e($data['section']) . '</span>';
    }
    if ($fix !== '') {
        $badges .= '<span class="badge">' . i18n('transferFixBadge', ['fix' => $fix]) . '</span>';
    }
    $badges .= '<span class="badge">' . i18n('transferGroupCount', ['count' => count($groups)]) . '</span>';
    $notes = '';
    if (!empty($data['notes'])) {
        $notes = '<div class="route-notes"><h4>' . i18n('transferNotes') . '</h4><ul>'
            . implode('', array_map(fn ($note) => '<li>' . e($note) . '</li>', $data['notes'])) . '</ul></div>';
    }
    $cards = '';
    foreach ($groups as $group) {
        $cards .= '<article class="route-card transfer-card">' . transfer_groups([$group]) . '</article>';
    }
    return '<div class="result-head"><p class="eyebrow">' . i18n($sideKey) . '</p><h2 class="result-pair">' . e($icao) . '</h2>'
        . '<div class="badges">' . $badges . '</div></div>' . $notes
        . '<div class="route-list">' . $cards . '</div>'
        . '<p class="data-line">' . i18n('transferCycle', ['cycle' => $data['transfer_cycle'] ?? '—']) . '</p>';
}
