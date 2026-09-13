# Japan Route Finder

A lightweight static website for searching published AIP routes between airports in Japan.

This project was inspired by the AIP route search feature in Kevin's [Japan Flight Dispatcher](https://github.com/kevin-git-2026/japan-flight-dispatcher). It provides a separate, browser-based implementation focused exclusively on route lookup.

## Features

- English and Japanese interface
- Live JST and UTC clocks
- Exact route lookup by departure and arrival ICAO codes
- Optional late-night EOBT filtering for departures between 23:00 and 05:59 JST
- Published time, altitude, aircraft, and remarks fields
- One-click route copying
- Live data from `jp-routes`
- Browser cache fallback when the data source is temporarily unavailable
- Responsive layout for desktop and mobile devices
- Apple-inspired liquid glass interface on a clean white canvas

## Run Locally

Start any static file server from the project root. For example:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Attribution

The original application was created and is maintained by Kevin:

- Upstream project: [kevin-git-2026/japan-flight-dispatcher](https://github.com/kevin-git-2026/japan-flight-dispatcher)
- Jurina's existing fork of the original application: [lpxlpx7/japan-flight-dispatcher](https://github.com/lpxlpx7/japan-flight-dispatcher)

Many thanks to Kevin for the original application and its route-search concept.

This repository is intentionally separate from the existing fork. It contains only the independently implemented static website and does not include the upstream Python/Flet source tree. The upstream repository currently does not declare a license; no license rights to Kevin's original source code are asserted or granted by this repository.

Route data is provided by `jp-routes`.

This website is intended only for flight simulation and educational use. It must not be used for real-world flight planning or navigation.

Original Japan Flight Dispatcher copyright remains with Kevin. The Japan Route Finder web implementation is copyright © 2026 Jurina.

## License

The original code in this standalone web repository is licensed under the [GNU General Public License v2.0 only](LICENSE), identified by the SPDX expression `GPL-2.0-only`.

This license applies only to the files in this repository. It does not relicense Kevin's upstream Japan Flight Dispatcher project or the route data supplied by third parties.
