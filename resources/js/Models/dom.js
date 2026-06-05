/**
 * RoroDom — a tiny vanilla DOM helper shared by the whole runtime.
 *
 * It is NOT a jQuery replacement library: it is a thin, dependency-free layer
 * over native APIs that captures the handful of patterns the runtime repeats
 * (scoped queries, event binding, custom events, show/hide, template cloning).
 * Everything else uses the platform directly. Attached to window because the
 * runtime is injected as several separate <script> blocks that share globals.
 */
(function () {
    const RoroDom = {
        // ---- selection -----------------------------------------------------
        byId(id) { return document.getElementById(id); },

        // qs(sel) searches the document; qs(root, sel) searches within root.
        qs(root, sel) {
            if (sel === undefined) { sel = root; root = document; }
            return root ? root.querySelector(sel) : null;
        },
        qsa(root, sel) {
            if (sel === undefined) { sel = root; root = document; }
            return root ? Array.from(root.querySelectorAll(sel)) : [];
        },
        closest(el, sel) { return el ? el.closest(sel) : null; },
        matches(el, sel) { return !!(el && el.nodeType === 1 && el.matches(sel)); },

        // Direct element children, optionally filtered by a selector.
        children(el, sel) {
            if (!el) return [];
            const kids = Array.from(el.children);
            return sel ? kids.filter(k => k.matches(sel)) : kids;
        },

        // Position of el among its element siblings.
        index(el) {
            if (!el || !el.parentNode) return -1;
            return Array.prototype.indexOf.call(el.parentNode.children, el);
        },

        // ---- events --------------------------------------------------------
        // `events` may be a space-separated list. Returns the handler so callers
        // can keep a reference for off().
        on(el, events, handler, opts) {
            if (!el) return handler;
            events.split(/\s+/).forEach(e => e && el.addEventListener(e, handler, opts));
            return handler;
        },
        off(el, events, handler) {
            if (!el) return;
            events.split(/\s+/).forEach(e => e && el.removeEventListener(e, handler));
        },
        // Dispatch a (bubbling) event. `detail` is carried on CustomEvent.detail
        // — this is how roro:change / roro:ajax:* pass their payload.
        emit(el, name, detail) {
            if (!el) return;
            el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
        },

        // ---- visibility ----------------------------------------------------
        show(el, display = '') { if (el) el.style.display = display; },
        hide(el) { if (el) el.style.display = 'none'; },
        toggle(el, force) {
            if (!el) return;
            const visible = force === undefined ? el.style.display === 'none' : force;
            el.style.display = visible ? '' : 'none';
        },
        // Visible unless it (or an ancestor) is display:none and it is in the DOM.
        isVisible(el) {
            if (!el) return false;
            let node = el;
            while (node && node.nodeType === 1) {
                if (node.style && node.style.display === 'none') return false;
                node = node.parentElement;
            }
            return document.body.contains(el);
        },

        // ---- classes -------------------------------------------------------
        addClass(el, classes) { if (el) el.classList.add(...split(classes)); },
        removeClass(el, classes) { if (el) el.classList.remove(...split(classes)); },
        toggleClass(el, cls, force) { if (el) el.classList.toggle(cls, force); },

        // ---- building / structure -----------------------------------------
        // Build a single element from an HTML string (template-based, so <tr>,
        // <option>, <template> content all parse correctly).
        fromHTML(html) {
            const tpl = document.createElement('template');
            tpl.innerHTML = String(html == null ? '' : html).trim();
            return tpl.content.firstElementChild;
        },
        empty(el) { if (el) el.replaceChildren(); },

        // ---- ready ---------------------------------------------------------
        // Defers like jQuery: when the document is already parsed, run on the
        // next tick (so the rest of the concatenated runtime is defined first),
        // otherwise wait for DOMContentLoaded.
        ready(fn) {
            if (document.readyState !== 'loading') setTimeout(fn, 0);
            else document.addEventListener('DOMContentLoaded', fn, { once: true });
        },

        // ---- forms ---------------------------------------------------------
        // Like jQuery.serializeArray(): successful controls only (skips disabled,
        // unchecked checkboxes/radios, buttons). Returns [{name, value}, ...].
        serializeArray(form) {
            const out = [];
            if (!form) return out;
            Array.from(form.elements).forEach(el => {
                const name = el.name;
                if (!name || el.disabled) return;
                const tag = el.tagName.toLowerCase();
                const type = (el.type || '').toLowerCase();
                if (tag === 'button' || type === 'submit' || type === 'reset' || type === 'file' || type === 'button') return;
                if ((type === 'checkbox' || type === 'radio') && !el.checked) return;
                if (tag === 'select' && el.multiple) {
                    Array.from(el.selectedOptions).forEach(o => out.push({ name, value: o.value }));
                    return;
                }
                out.push({ name, value: el.value });
            });
            return out;
        },
    };

    function split(classes) {
        return String(classes == null ? '' : classes).split(/\s+/).filter(Boolean);
    }

    window.RoroDom = RoroDom;
})();
