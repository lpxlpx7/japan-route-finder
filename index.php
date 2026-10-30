<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

$language = current_language();
$query = [
    'dep' => normalize_icao((string) ($_GET['dep'] ?? '')),
    'arr' => normalize_icao((string) ($_GET['arr'] ?? '')),
    'eobt' => trim((string) ($_GET['eobt'] ?? '')),
    'transfer' => ($_GET['transfer'] ?? '') === '1',
];
$searched = isset($_GET['dep']) || isset($_GET['arr']);

$error = null;
if ($searched) {
    if ($query['dep'] === '' || $query['arr'] === '') {
        $error = 'errorRequired';
    } elseif (strlen($query['dep']) !== 4 || strlen($query['arr']) !== 4) {
        $error = 'errorInvalid';
    } elseif ($query['dep'] === $query['arr']) {
        $error = 'errorSame';
    } elseif ($query['eobt'] !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $query['eobt'])) {
        $error = 'errorEobt';
    }
}

$results = '';
if ($searched && $error === null) {
    $response = fetch_route($query['dep'], $query['arr'], $query['eobt']);
    $transfers = null;
    if ($query['transfer'] && $response['ok']) {
        $data = $response['data'];
        $routes = array_column($data['source'] === 'aip' ? ($data['aip_routes'] ?? []) : (isset($data['generated']) ? [$data['generated']] : []), 'route');
        $transfers = fetch_transfers(route_transfer_lookups($query['dep'], $query['arr'], $routes));
    }
    $results = render_results($query, $response, $transfers);
}

// The page script fetches just the results when a search is made without a reload.
if (isset($_GET['partial'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['errorKey' => $error, 'html' => $results], JSON_UNESCAPED_UNICODE);
    exit;
}

page_start('routes', 'Published AIP routes between Japanese airports, with a generated reference route when none is published.',
    ['assets/vendor/leaflet/leaflet.js', 'assets/js/map.js', 'assets/js/app.js'], ['assets/vendor/leaflet/leaflet.css']);
?>
  <main>
    <section class="hero shell">
      <h1 data-i18n="heroTitle"><?= t('heroTitle') ?></h1>
      <p class="lead" data-i18n="heroLead"><?= e(t('heroLead')) ?></p>

      <form class="search-card" id="route-form" action="./" method="get" novalidate>
        <div class="airport-fields">
          <label class="field">
            <span data-i18n="departure"><?= e(t('departure')) ?></span>
            <input name="dep" type="text" value="<?= e($query['dep']) ?>" placeholder="RJTT" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" required>
          </label>
          <button class="swap-button" type="button" aria-label="<?= e(t('swap')) ?>" data-i18n-aria-label="swap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11m0 0-3.5-3.5M18 7l-3.5 3.5M17 17H6m0 0 3.5-3.5M6 17l3.5 3.5"/></svg>
          </button>
          <label class="field">
            <span data-i18n="arrival"><?= e(t('arrival')) ?></span>
            <input name="arr" type="text" value="<?= e($query['arr']) ?>" placeholder="RJBB" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" required>
          </label>
        </div>
        <div class="form-options">
          <?= switch_control('transfer', 'transferToggle', $query['transfer']) ?>
          <p class="field-hint" data-i18n="transferToggleHint"><?= e(t('transferToggleHint')) ?></p>
        </div>
        <div class="form-row">
          <label class="field field-time">
            <span data-i18n="eobt"><?= e(t('eobt')) ?></span>
            <input name="eobt" type="time" value="<?= e($query['eobt']) ?>">
          </label>
          <p class="field-hint" data-i18n="eobtHint"><?= e(t('eobtHint')) ?></p>
          <button class="button button-primary" type="submit"><span data-i18n="search"><?= e(t('search')) ?></span></button>
        </div>
        <p class="form-error" role="alert"<?= $error ? ' data-i18n="' . e($error) . '"' : '' ?>><?= $error ? e(t($error)) : '' ?></p>
      </form>

      <div class="examples">
        <span data-i18n="examples"><?= e(t('examples')) ?></span>
        <a href="?dep=RJTT&amp;arr=RJBB" data-dep="RJTT" data-arr="RJBB">RJTT → RJBB</a>
        <a href="?dep=RJAA&amp;arr=RJCC" data-dep="RJAA" data-arr="RJCC">RJAA → RJCC</a>
        <a href="?dep=RJOA&amp;arr=RJKA" data-dep="RJOA" data-arr="RJKA">RJOA → RJKA</a>
      </div>

      <div class="clocks" aria-live="off">
        <div><span data-i18n="clockJst"><?= e(t('clockJst')) ?></span><time id="jst-clock">--:--:--</time></div>
        <div><span data-i18n="clockUtc"><?= e(t('clockUtc')) ?></span><time id="utc-clock">--:--:--</time></div>
      </div>
    </section>

    <section class="results shell" id="results" aria-live="polite"<?= $results === '' ? ' hidden' : '' ?>><?= $results ?></section>

    <section class="about shell">
      <div class="about-card">
        <p class="eyebrow" data-i18n="aboutEyebrow"><?= e(t('aboutEyebrow')) ?></p>
        <h2 data-i18n="aboutTitle"><?= e(t('aboutTitle')) ?></h2>
        <p data-i18n="aboutAip"><?= t('aboutAip') ?></p>
        <p data-i18n="aboutGenerated"><?= e(t('aboutGenerated')) ?></p>
        <p data-i18n="aboutKevin"><?= t('aboutKevin') ?></p>
      </div>
    </section>
  </main>
<?php page_end();
