<?php
declare(strict_types=1);

/** The airports SWIM's ATIS service covers (Jurina API docs/atis.md), with names to search by. */
const ATIS_AIRPORT_NAMES = [
    'RJCC' => ['New Chitose', '新千歳'], 'RJCH' => ['Hakodate', '函館'], 'RJSS' => ['Sendai', '仙台'],
    'RJAA' => ['Tokyo Narita', '成田'], 'RJTT' => ['Tokyo Haneda', '羽田'], 'RJSN' => ['Niigata', '新潟'],
    'RJGG' => ['Chubu Centrair', '中部'], 'RJOO' => ['Osaka Itami', '伊丹'], 'RJBB' => ['Kansai', '関西'],
    'RJBE' => ['Kobe', '神戸'], 'RJOA' => ['Hiroshima', '広島'], 'RJOT' => ['Takamatsu', '高松'],
    'RJOM' => ['Matsuyama', '松山'], 'RJOK' => ['Kochi', '高知'], 'RJFF' => ['Fukuoka', '福岡'],
    'RJFS' => ['Saga', '佐賀'], 'RJFU' => ['Nagasaki', '長崎'], 'RJFT' => ['Kumamoto', '熊本'],
    'RJFO' => ['Oita', '大分'], 'RJFM' => ['Miyazaki', '宮崎'], 'RJFK' => ['Kagoshima', '鹿児島'],
    'ROAH' => ['Naha', '那覇'], 'ROIG' => ['Ishigaki', '石垣'],
];
const ATIS_AIRPORTS = ['RJCC', 'RJCH', 'RJSS', 'RJAA', 'RJTT', 'RJSN', 'RJGG', 'RJOO', 'RJBB', 'RJBE', 'RJOA', 'RJOT',
    'RJOM', 'RJOK', 'RJFF', 'RJFS', 'RJFU', 'RJFT', 'RJFO', 'RJFM', 'RJFK', 'ROAH', 'ROIG'];

/** The airport's own site icon from assets/airports, when we have one. */
function airport_icon(string $icao): string
{
    static $files = null;
    if ($files === null) {
        $files = [];
        foreach (glob(__DIR__ . '/../assets/airports/*') ?: [] as $path) {
            $files[pathinfo($path, PATHINFO_FILENAME)] = 'assets/airports/' . basename($path);
        }
    }
    return isset($files[$icao]) ? '<img class="airport-icon" src="' . e($files[$icao]) . '" alt="" loading="lazy">' : '';
}

/** "2026-11-01T01:00:00Z" → "0100Z · 10:00 JST". */
function atis_time(?string $iso): string
{
    $time = $iso ? strtotime($iso) : false;
    if ($time === false) {
        return '';
    }
    return gmdate('Hi', $time) . 'Z · ' . gmdate('H:i', $time + 9 * 3600) . ' JST';
}

function fetch_atis(array $icaos): array
{
    $icaos = array_values(array_intersect(array_unique($icaos), ATIS_AIRPORTS));
    if (!$icaos) {
        return [];
    }
    $response = api_get_many(['atis' => ['/v1/atis/', ['icao' => implode(',', $icaos)]]])['atis'];
    $items = [];
    foreach ($response['ok'] ? ($response['data']['airports'] ?? []) : [] as $item) {
        $items[$item['icao']] = $item;
    }
    return ['ok' => $response['ok'], 'items' => $items];
}

/** One airport's ATIS. $item is an entry from the API, or null when there is nothing to show. */
function atis_card(string $icao, ?array $item, bool $ok = true): string
{
    $atis = $item['atis'] ?? null;
    if (!$atis) {
        $key = !in_array($icao, ATIS_AIRPORTS, true) ? 'atisNotCovered' : ($ok ? 'atisNone' : 'atisError');
        return '<article class="atis-card atis-empty"><div class="atis-head"><h3>' . e($icao) . '</h3></div>'
            . i18n($key, ['icao' => $icao], 'p', ' class="transfer-empty"') . '</article>';
    }
    $badges = '';
    if (!empty($atis['observed_at'])) {
        $badges .= '<span class="badge">' . e(atis_time($atis['observed_at'])) . '</span>';
    }
    if (!empty($item['stale'])) {
        $badges .= '<span class="badge badge-warn">' . i18n('atisStale') . '</span>';
    }
    // The airport's logo where we have one; otherwise the ATIS letter in a blue tile.
    $logo = airport_icon($icao);
    $letter = $logo !== '' ? '<span class="atis-logo">' . $logo . '</span>'
        : (!empty($atis['letter']) ? '<span class="atis-letter" title="ATIS ' . e($atis['letter']) . '">' . e($atis['letter']) . '</span>' : '');
    $checked = !empty($item['checked_at']) ? '<p class="atis-checked">' . i18n('atisChecked', ['time' => atis_time($item['checked_at'])]) . '</p>' : '';
    return '<article class="atis-card"><div class="atis-head">' . $letter . '<div><h3>' . e($icao) . '</h3>'
        . (!empty($atis['letter']) ? '<p class="atis-info">' . i18n('atisInformation', ['letter' => $atis['letter']]) . '</p>' : '')
        . '</div><div class="badges">' . $badges . '</div>' . copy_button((string) $atis['text']) . '</div>'
        . '<pre class="atis-text">' . e((string) $atis['text']) . '</pre>' . $checked . '</article>';
}

/** Departure and arrival ATIS under the route results. */
function render_atis_block(string $dep, string $arr, array $atis): string
{
    $cards = '';
    foreach ([$dep, $arr] as $icao) {
        $cards .= atis_card($icao, $atis['items'][$icao] ?? null, $atis['ok'] ?? true);
    }
    return '<section class="atis-block"><h3 class="section-title">' . i18n('atisToggle') . '</h3><div class="atis-grid">' . $cards . '</div></section>';
}

/** Results on the ATIS page: the chosen airport and its recent changes. */
function render_atis_page(string $icao, array $responses): string
{
    $list = $responses['list'] ?? null;
    if (!$list || !$list['ok']) {
        return '<div class="notice-card">' . i18n('atisError', [], 'p') . '</div>';
    }
    $items = $list['data']['airports'] ?? [];
    $html = '<div class="atis-grid atis-grid-single">' . atis_card($icao, $items[0] ?? null) . '</div>';
    $history = ($responses['history']['ok'] ?? false) ? ($responses['history']['data']['history'] ?? []) : [];
    // The first entry is the ATIS already shown above.
    $earlier = array_slice($history, 1);
    if ($earlier) {
        $rows = '';
        foreach ($earlier as $entry) {
            $summary = '<span class="atis-letter atis-letter-small">' . e($entry['letter'] ?? '–') . '</span><span>'
                . e(atis_time($entry['observed_at'] ?? $entry['first_seen'] ?? null)) . '</span>';
            $rows .= '<details class="atis-history-item"><summary>' . $summary . '</summary><pre class="atis-text">' . e((string) ($entry['text'] ?? '')) . '</pre></details>';
        }
        $html .= '<section class="atis-history"><h3 class="section-title">' . i18n('atisHistory') . '</h3>' . $rows . '</section>';
    }
    [$en, $ja] = ATIS_AIRPORT_NAMES[$icao] ?? ['', ''];
    return '<div class="result-head"><p class="eyebrow">ATIS</p><h2 class="result-pair">' . e($icao) . '</h2>'
        . '<p class="result-name">' . e("$en · $ja") . '</p></div>' . $html;
}
