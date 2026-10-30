<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

$language = current_language();
$query = [
    'dep' => normalize_icao((string) ($_GET['dep'] ?? '')),
    'arr' => normalize_icao((string) ($_GET['arr'] ?? '')),
    'eobt' => trim((string) ($_GET['eobt'] ?? '')),
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
$results = $searched && $error === null ? render_results($query, fetch_route($query['dep'], $query['arr'], $query['eobt'])) : '';

// The page script fetches just the results when a search is made without a reload.
if (isset($_GET['partial'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => $error ? t($error) : null, 'errorKey' => $error, 'html' => $results], JSON_UNESCAPED_UNICODE);
    exit;
}

$asset = fn (string $path) => e($path) . '?v=' . filemtime(__DIR__ . '/' . $path);
?>
<!doctype html>
<html lang="<?= $language ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="Published AIP routes between Japanese airports, with a generated reference route when none is published.">
  <meta name="theme-color" content="#f5f5f7">
  <title><?= e(t('pageTitle')) ?></title>
  <script src="<?= $asset('assets/js/theme-init.js') ?>"></script>
  <link rel="stylesheet" href="<?= $asset('assets/vendor/leaflet/leaflet.css') ?>">
  <link rel="stylesheet" href="<?= $asset('assets/css/style.css') ?>">
  <script>window.TRANSLATIONS = <?= json_encode(TRANSLATIONS, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
  <script src="<?= $asset('assets/vendor/leaflet/leaflet.js') ?>" defer></script>
  <script src="<?= $asset('assets/js/map.js') ?>" defer></script>
  <script src="<?= $asset('assets/js/app.js') ?>" defer></script>
</head>
<body>
  <header class="site-header">
    <nav class="nav shell" aria-label="Primary navigation">
      <a class="brand" href="./" data-i18n="brand"><?= e(t('brand')) ?></a>
      <div class="nav-right">
        <fieldset class="language-switch" aria-label="<?= e(t('languageLabel')) ?>" data-i18n-aria-label="languageLabel">
          <legend data-i18n="languageLabel"><?= e(t('languageLabel')) ?></legend>
          <label class="language-option"><input class="language-button" type="radio" name="language" value="en"<?= $language === 'en' ? ' checked' : '' ?>><span>EN</span></label>
          <label class="language-option"><input class="language-button" type="radio" name="language" value="ja"<?= $language === 'ja' ? ' checked' : '' ?>><span>日本語</span></label>
        </fieldset>
        <button class="theme-button" type="button" aria-label="<?= e(t('themeLabel')) ?>" data-i18n-aria-label="themeLabel"><span class="theme-icon" aria-hidden="true"><span class="icon icon-moon"></span></span></button>
      </div>
    </nav>
  </header>

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

  <footer class="site-footer shell">
    <p class="footer-notice" data-i18n="footerNotice"><?= e(t('footerNotice')) ?></p>
    <div class="footer-links">
      <a href="https://www.jurina.org/" target="_blank" rel="noopener noreferrer"><span data-i18n="footerHome"><?= e(t('footerHome')) ?></span> <span class="icon icon-external" aria-hidden="true"></span></a>
      <a href="https://github.com/lpxlpx7/japan-route-finder" target="_blank" rel="noopener noreferrer"><span data-i18n="footerSource"><?= e(t('footerSource')) ?></span> <span class="icon icon-external" aria-hidden="true"></span></a>
      <a href="https://github.com/kevin-git-2026/japan-flight-dispatcher" target="_blank" rel="noopener noreferrer"><span data-i18n="footerOriginal"><?= e(t('footerOriginal')) ?></span> <span class="icon icon-external" aria-hidden="true"></span></a>
    </div>
    <p class="copyright">© 2026 Jurina &amp; Kevin</p>
  </footer>

  <div class="toast" role="status" aria-live="polite"></div>
</body>
</html>
