class RoroFile extends RoroElement {

    filenameLabelTemplate;
    filenameLabelContainer;
    wrapper;

    constructor(id = null) {
        super('file', id);
        const self = this;
        self.ready.then(function () {
            self.init();
            self.registerEvents();
        });
    }

    init() {
        if (!this.elt) return;   // element vanished before init (null-safe, like jQuery)
        this.wrapper = this.elt.closest('.roro-wrapper');
        this.filenameLabelTemplate = RoroDom.qs(this.wrapper, '.roro-file-name');
        this.filenameLabelContainer = RoroDom.qs(this.wrapper, '.roro-file-name-container');
    }

    registerEvents() {
        // registerEvents() is first called by the base (before init(), so
        // filenameLabelTemplate is undefined). Only bind after init, and only if
        // the template actually exists in the DOM.
        if (!this.filenameLabelTemplate) return;

        const self = this;

        RoroDom.on(self.elt, 'change', function () {
            self.filenameLabelContainer.replaceChildren();

            Array.from(self.elt.files).forEach(function (file, index) {
                const label = self.filenameLabelTemplate.cloneNode(true);
                RoroDom.show(label);

                const text = RoroDom.qs(label, '.roro-file-name-text');
                if (text) text.textContent = file.name;

                const del = RoroDom.qs(label, '.roro-file-name-delete');
                RoroDom.on(del, 'click', function () {
                    const dt = new DataTransfer();
                    Array.from(self.elt.files).forEach((f, i) => {
                        if (i !== index) dt.items.add(f);
                    });

                    self.elt.files = dt.files;
                    label.remove();
                });

                self.filenameLabelContainer.appendChild(label);
            });
        });
    }
}

window.RoroFile = RoroFile;
