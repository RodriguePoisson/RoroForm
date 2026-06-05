/**
 * Minimal base: resolves a DOM element by its id. Elements are rendered
 * server-side, so there is no AJAX loading here.
 */
class RoroElement {
    constructor(eltType, id = null, prefixId = '') {
        this.eltType = eltType;
        this.id = id || (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
        if (prefixId) this.id = `${prefixId}-${this.id}`;

        this.ready = this.registerElement();
    }

    async registerElement() {
        // Let the DOM settle, then resolve the element by its id.
        await new Promise(resolve => setTimeout(resolve, 0));
        this.elt = $('#' + this.id);
        this.registerEvents();
        return this;
    }

    // Overridden by subclasses.
    registerEvents() {}

    syncDom() {}
}
