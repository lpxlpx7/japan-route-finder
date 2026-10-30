<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

$language = current_language();
$icao = normalize_icao((string) ($_GET['icao'] ?? ''));
$side = ($_GET['side'] ?? 'arr') === 'dep' ? 'dep' : 'arr';
$fix = substr((string) preg_replace('/[^A-Z0-9]/', '', strtoupper((string) ($_GET['fix'] ?? ''))), 0, 7);
$searched = isset($_GET['icao']);

$error = null;
if ($searched && strlen($icao) !== 4) {
    $error = 'errorAirport';
} elseif ($fix !== '' && strlen($fix) < 2) {
    $fix = '';
}

// The whole table for this airport and side gives both the fix list and the "all" view.
$requests = [];
if ($searched && $error === null) {
    $requests['all'] = [$icao, $side, ''];
    if ($fix !== '' && !isset($_GET['list'])) {
        $requests['fix'] = [$icao, $side, $fix];
    }
}
$responses = fetch_transfers($requests);
$all = $responses['all'] ?? null;
$fixes = $all && $all['ok'] ? transfer_fixes($all['data']['groups'] ?? []) : [];

// The page script loads the fix list when an airport is entered.
if (isset($_GET['list'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    $listError = $error;
    if (!$listError && (!$all || !$all['ok'])) {
        $listError = ($all['data']['error']['code'] ?? '') === 'airport_not_found' ? 'transferNoAirportShort' : 'transferError';
    }
    echo json_encode(['errorKey' => $listError, 'icao' => $icao, 'fixes' => $fixes], JSON_UNESCAPED_UNICODE);
    exit;
}

$results = $searched && $error === null ? render_transfer_page($icao, $side, $fix, $fix !== '' ? ($responses['fix'] ?? null) : $all) : '';

if (isset($_GET['partial'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['errorKey' => $error, 'html' => $results], JSON_UNESCAPED_UNICODE);
    exit;
}

page_start('transfer', 'ATC transfer points and altitudes for Japanese airports.', ['assets/js/transfer.js']);
?>
  <main>
    <section class="hero shell">
      <h1 data-i18n="transferTitle"><?= t('transferTitle') ?></h1>
      <p class="lead" data-i18n="transferLead"><?= e(t('transferLead')) ?></p>

      <form class="search-card" id="transfer-form" action="transfer.php" method="get" novalidate>
        <div class="transfer-fields">
          <label class="field">
            <span data-i18n="airport"><?= e(t('airport')) ?></span>
            <input name="icao" type="text" value="<?= e($icao) ?>" placeholder="RJTT" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" required>
          </label>
          <fieldset class="field segmented-field">
            <legend data-i18n="transferSide"><?= e(t('transferSide')) ?></legend>
            <div class="segmented">
              <label><input type="radio" name="side" value="arr"<?= $side === 'arr' ? ' checked' : '' ?>><span data-i18n="arrival"><?= e(t('arrival')) ?></span></label>
              <label><input type="radio" name="side" value="dep"<?= $side === 'dep' ? ' checked' : '' ?>><span data-i18n="departure"><?= e(t('departure')) ?></span></label>
            </div>
          </fieldset>
          <label class="field">
            <span data-i18n="fix"><?= e(t('fix')) ?></span>
            <span class="select-shell">
              <select name="fix"<?= $fixes ? '' : ' disabled' ?>>
                <option value="" data-i18n="fixAll"><?= e(t('fixAll')) ?></option>
<?php foreach ($fixes as $option): ?>
                <option value="<?= e($option) ?>"<?= $option === $fix ? ' selected' : '' ?>><?= e($option) ?></option>
<?php endforeach; ?>
              </select>
            </span>
          </label>
        </div>
        <div class="form-row form-row-end">
          <p class="field-hint" data-i18n="fixHint"><?= e(t('fixHint')) ?></p>
          <button class="button button-primary" type="submit"><span data-i18n="search"><?= e(t('search')) ?></span></button>
        </div>
        <p class="form-error" role="alert"<?= $error ? ' data-i18n="' . e($error) . '"' : '' ?>><?= $error ? e(t($error)) : '' ?></p>
      </form>

      <div class="examples">
        <span data-i18n="examples"><?= e(t('examples')) ?></span>
        <a href="?icao=RJTT&amp;side=arr" data-icao="RJTT" data-side="arr">RJTT <span data-i18n="arrival"><?= e(t('arrival')) ?></span></a>
        <a href="?icao=RJTT&amp;side=dep" data-icao="RJTT" data-side="dep">RJTT <span data-i18n="departure"><?= e(t('departure')) ?></span></a>
        <a href="?icao=RJBB&amp;side=arr" data-icao="RJBB" data-side="arr">RJBB <span data-i18n="arrival"><?= e(t('arrival')) ?></span></a>
      </div>
    </section>

    <section class="results shell" id="results" aria-live="polite"<?= $results === '' ? ' hidden' : '' ?>><?= $results ?></section>
  </main>
<?php page_end();
