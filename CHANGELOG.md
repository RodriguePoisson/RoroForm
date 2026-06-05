# Changelog

All notable changes to RoroForm are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/).

## [2.0.0] — 2026-06-06

The runtime is now **dependency-free vanilla JavaScript** — jQuery has been
removed entirely. The whole change is covered by **814 automated tests**
(Pest + Vitest), and CI runs them across PHP 8.2–8.4 and Laravel 11–12.

### ⚠️ Breaking changes (front-end)

RoroForm no longer requires or loads jQuery. If your app loaded jQuery *only* for
RoroForm, you can drop it. A few JavaScript contracts changed when jQuery went
away:

- **Custom events carry their payload on `event.detail`.** `roro:change`,
  `roro:ajax:success` and `roro:ajax:error` are now native `CustomEvent`s — the
  value/response is on `event.detail` (it used to be a jQuery second handler arg).

  ```js
  // before (jQuery)
  $('#signup').on('roro:ajax:success', (e, response) => { /* … */ });

  // after (vanilla)
  document.getElementById('signup')
      .addEventListener('roro:ajax:success', e => { const response = e.detail; /* … */ });

  // …or the facade shortcut (payload first — unchanged):
  roro.form('signup').onSuccess(response => { /* … */ });
  ```

- **The facade element accessors return DOM Elements, not jQuery objects.**
  `roro(id).$el()`, `.$control()`, `.$wrapper()` now return a DOM `Element` (or
  `null`). Use `.value` instead of `.val()`, a truthiness check instead of
  `.length`, etc. `.el()` / `.control()` / `.wrapper()` are the canonical names.

- **`roro(target)` and `addSelect()` / `addMultiSelect()` accept a string id or a
  DOM Element** — not a jQuery object.

- **AJAX submit uses `fetch`** instead of `$.ajax`; the `roro:ajax:error` payload
  exposes `{ status, response, responseJSON }`.

Everything you write day-to-day is otherwise unchanged — `roro('email').value(…)
.required().focus()`, `roro.form('signup').fill(…)`, the repeatable & select
APIs, and every `window.roro*` one-liner keep working exactly as before.

### Added

- **Zero runtime dependencies** — vanilla-JS runtime; drop it into Livewire,
  Alpine, Inertia, Vue, React or plain Blade without conflicts.
- **CSP nonce support** — set `config('roroform.nonce')` (a string, or a Closure
  resolved per request) and the injected `<script>` / `<style>` tags carry it.
  See `config/roroform.php`. (Inline `style="…"` *attributes* on toggled elements
  can't carry a nonce — allow `style-src 'unsafe-inline'` for those.)
- **`mergeConfigFrom`** in the service provider — publishing the config is now
  optional; the packaged defaults always apply.
- **A full automated test suite** (814 tests) — Pest + Orchestra Testbench for the
  Blade components, Vitest + jsdom for the runtime. See
  [`tests/README.md`](tests/README.md).
- **GitHub Actions CI** running both suites across the supported matrix.

### Fixed

- `min=""` / `max=""` are no longer emitted on date/number/range inputs when no
  bounds are supplied (they render only when provided).
- `border-error`'s `data-show` attribute is now symmetric (`"0"` / `"1"`).
- `roro.form(id).fill({ tags: ['a', 'b'] })` now assigns one value per
  `name="tags[]"` input (it used to join the array into a single string).
- Multi-select search now actually filters the options (it previously matched
  every option).

## [1.x] — the jQuery era

The original jQuery-based runtime. No releases were formally tagged; `2.0.0` is
the first versioned, tested release.
