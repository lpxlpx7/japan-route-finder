<?php
declare(strict_types=1);

function asset(string $path): string
{
    return e($path) . '?v=' . filemtime(__DIR__ . '/../' . $path);
}

/**
 * @param string $page 'routes' or 'transfer', for the nav and the page title
 * @param list<string> $scripts page scripts after common.js
 */
function page_start(string $page, string $description, array $scripts, array $styles = []): void
{
    global $language;
    $titleKey = $page === 'transfer' ? 'transferPageTitle' : 'pageTitle';
    $nav = '';
    foreach (['routes' => ['./', 'navRoutes'], 'transfer' => ['transfer.php', 'navTransfer']] as $name => [$href, $key]) {
        $nav .= '<a href="' . $href . '"' . ($name === $page ? ' class="is-active" aria-current="page"' : '') . '>' . i18n($key) . '</a>';
    }
    ?>
<!doctype html>
<html lang="<?= $language ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="<?= e($description) ?>">
  <meta name="theme-color" content="#f5f5f7">
  <title><?= e(t($titleKey)) ?></title>
  <script src="<?= asset('assets/js/theme-init.js') ?>"></script>
<?php foreach ($styles as $style): ?>
  <link rel="stylesheet" href="<?= asset($style) ?>">
<?php endforeach; ?>
  <link rel="stylesheet" href="<?= asset('assets/css/style.css') ?>">
  <script>window.TRANSLATIONS = <?= json_encode(TRANSLATIONS, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
  <script src="<?= asset('assets/js/common.js') ?>" defer></script>
<?php foreach ($scripts as $script): ?>
  <script src="<?= asset($script) ?>" defer></script>
<?php endforeach; ?>
</head>
<body data-title-key="<?= $titleKey ?>">
  <header class="site-header">
    <nav class="nav shell" aria-label="Primary navigation">
      <a class="brand" href="./" data-i18n="brand"><?= e(t('brand')) ?></a>
      <div class="nav-right">
        <div class="nav-links"><?= $nav ?></div>
        <fieldset class="language-switch" aria-label="<?= e(t('languageLabel')) ?>" data-i18n-aria-label="languageLabel">
          <legend data-i18n="languageLabel"><?= e(t('languageLabel')) ?></legend>
          <label class="language-option"><input class="language-button" type="radio" name="language" value="en"<?= $language === 'en' ? ' checked' : '' ?>><span>EN</span></label>
          <label class="language-option"><input class="language-button" type="radio" name="language" value="ja"<?= $language === 'ja' ? ' checked' : '' ?>><span>日本語</span></label>
        </fieldset>
        <button class="theme-button" type="button" aria-label="<?= e(t('themeLabel')) ?>" data-i18n-aria-label="themeLabel"><span class="theme-icon" aria-hidden="true"><span class="icon icon-moon"></span></span></button>
      </div>
    </nav>
  </header>
<?php
}

function page_end(): void
{
    ?>
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
<?php
}

/** iOS-style switch, the same control as Jurina API's map page. */
function switch_control(string $name, string $labelKey, bool $checked, string $attributes = ''): string
{
    return '<label class="switch-row"><input type="checkbox" name="' . e($name) . '" value="1"' . ($checked ? ' checked' : '') . $attributes . '>'
        . '<span class="switch" aria-hidden="true"></span>' . i18n($labelKey) . '</label>';
}
