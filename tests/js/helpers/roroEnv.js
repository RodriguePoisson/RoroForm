/**
 * Loads the RoroForm runtime into the jsdom global, exactly the way the Blade
 * helpers inline it in the browser: every source file concatenated, in
 * dependency order, into a single script scope. Because it is one scope, each
 * `class X extends Y` sees the classes declared before it, and every
 * `window.X = X` persists on the jsdom window afterwards.
 *
 * The runtime is dependency-free (vanilla DOM, no jQuery), so the loader binds
 * nothing extra. Tests drive the DOM with native APIs (document.querySelector,
 * element.value, dispatchEvent, ...) and assert the runtime's behavioural
 * contract (given this DOM/these inputs, the value/markup is X).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'resources/js');

// Mirrors build.mjs / the inline-injection order; `extends` clauses resolve.
const FILES = [
    'Models/dom.js',
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

/** Run the concatenated runtime once against the jsdom window. */
export function loadRoro() {
    if (!scriptLoaded) {
        const src = FILES
            .map((f) => fs.readFileSync(path.join(SRC, f), 'utf8'))
            .join('\n;\n');
        // One function body => later `class X extends Y` see earlier classes,
        // and every `window.X = X` persists on the jsdom window afterwards.
        const run = new Function('window', 'document', 'crypto', src);
        run(window, window.document, globalThis.crypto);
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
