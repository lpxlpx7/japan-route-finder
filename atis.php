<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

$language = current_language();
$icao = normalize_icao((string) ($_GET['icao'] ?? ''));
$error = $icao !== '' && !in_array($icao, ATIS_AIRPORTS, true) ? 'atisUnknownAirport' : null;

// Nothing is shown until an airport is picked.
$results = '';
if ($error === null && $icao !== '') {
    $results = render_atis_page($icao, api_get_many([
        'list' => ['/v1/atis/', ['icao' => $icao]],
        'history' => ["/v1/atis/$icao/history", ['limit' => 11]],
    ]));
}

if (isset($_GET['partial'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['errorKey' => $error, 'html' => $results], JSON_UNESCAPED_UNICODE);
    exit;
}

page_start('atis', 'Current ATIS for Japanese airports, from SWIM.', ['assets/js/atis.js']);
?>
  <main>
    <section class="hero shell">
      <h1 data-i18n="atisTitle"><?= t('atisTitle') ?></h1>
      <p class="lead" data-i18n="atisLead"><?= e(t('atisLead')) ?></p>

      <form class="search-card" id="atis-form" action="atis.php" method="get" novalidate>
        <div class="form-row form-row-end">
          <label class="field">
            <span data-i18n="airport"><?= e(t('airport')) ?></span>
            <span class="combo">
              <input name="icao" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="airport-list" placeholder="<?= e(t('atisPlaceholder')) ?>" autocomplete="off" spellcheck="false">
              <button class="combo-toggle" type="button" tabindex="-1" aria-label="<?= e(t('atisShowAll')) ?>" data-i18n-aria-label="atisShowAll"></button>
              <ul class="combo-list" id="airport-list" role="listbox" hidden>
<?php foreach (ATIS_AIRPORT_NAMES as $code => [$en, $ja]): ?>
                <li role="option" id="airport-<?= $code ?>" data-code="<?= $code ?>" data-search="<?= e(strtolower("$code $en $ja")) ?>" aria-selected="false"><?= airport_icon($code) ?: '<span class="airport-icon airport-icon-blank"></span>' ?><b><?= $code ?></b><span><?= e("$en · $ja") ?></span></li>
<?php endforeach; ?>
              </ul>
            </span>
          </label>
          <button class="button button-primary" type="submit"><span data-i18n="search"><?= e(t('search')) ?></span></button>
        </div>
        <p class="form-error" role="alert"<?= $error ? ' data-i18n="' . e($error) . '"' : '' ?>><?= $error ? e(t($error)) : '' ?></p>
      </form>
    </section>

    <section class="results shell" id="results" aria-live="polite"<?= $results === '' ? ' hidden' : '' ?>><?= $results ?></section>
  </main>
<?php page_end();
