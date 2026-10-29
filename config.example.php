<?php
// Copy to config.php and fill in. config.php is not committed.
// Environment variables JURINA_API_BASE and JURINA_API_KEY override these values.
return [
    // The site and Jurina API run on the same server, so talk to the container
    // directly instead of going out through https://api.jurina.org.
    'api_base' => 'http://127.0.0.1:8080',
    // One of the keys in the API's API_KEYS, e.g. the value after "web:".
    'api_key' => '',
    // Seconds. A cold route generation can take a few seconds.
    'timeout' => 30,
];
