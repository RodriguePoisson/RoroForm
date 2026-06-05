/**
 * Loads the RoroForm runtime into the jsdom global, exactly the way the Blade
 * helpers inline it in the browser: every source file concatenated, in
 * dependency order, into a single script scope. Because it is one scope, each
 * `class X extends Y` sees the classes declared before it, and every
 * `window.X = X` persists on the jsdom window afterwards.
 *
 * These tests assert the runtime's *behavioural contract* (given this DOM/these
 * inputs, the value/markup is X) — the contract a future vanilla rewrite must
 * preserve — not the jQuery implementation details.
 */
import fs from 'node:fs';
import path from 'node:path';
import jqueryImport from 'jquery';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'resources/js');

// Mirrors build.mjs / the inline-injection order; `extends` clauses resolve.
const FILES = [
    'Models/RoroElement.js',
    'Models/Input.js',
    'global.js',
    'form.js',
    'inputs.js',
    'facade.js',
    'Models/Selectable.js',
    'select.js',
    'Models/RoroFile.js',
    'file.js',
    'Models/RoroRepeatable.js',
    'repeatable.js',
];

let scriptLoaded = false;

/** Bind jQuery to the jsdom window and run the concatenated runtime once. */
export function loadRoro() {
    if (!window.$) {
        // `jquery` returns jQuery directly when a global document exists, or a
        // factory otherwise — handle both so the loader is environment-proof.
        const jQuery = (typeof jqueryImport === 'function' && jqueryImport.fn)
            ? jqueryImport
            : jqueryImport(window);
        window.$ = window.jQuery = jQuery;
        globalThis.$ = globalThis.jQuery = jQuery;
    }

    if (!scriptLoaded) {
        const src = FILES
            .map((f) => fs.readFileSync(path.join(SRC, f), 'utf8'))
            .join('\n;\n');
        const run = new Function('window', '$', 'jQuery', 'document', 'crypto', src);
        run(window, window.$, window.jQuery, window.document, globalThis.crypto);
        scriptLoaded = true;
    }

    return window;
}

/** Replace the document body and clear the runtime registries for a clean test. */
export function setBody(html) {
    document.body.innerHTML = html;
    window.listOfSelect = [];
    window.listOfRepeatable = [];
    return document.body;
}

/** Resolve once the microtask/0ms timers in RoroElement.registerElement settle. */
export function tick(ms = 5) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
