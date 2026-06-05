class RoroFile extends RoroElement {

    filenameLabelTemplate;
    filenameLabelContainer;
    wrapper;
    constructor(id = null) {
        super('file', id);
        let self = this;
        self.ready.then(function(){
           self.init();
           self.registerEvents();
        });

    }

    init(){
        this.wrapper = this.elt.closest('.roro-wrapper');
        this.filenameLabelTemplate = this.wrapper.find('.roro-file-name');
        this.filenameLabelContainer = this.wrapper.find('.roro-file-name-container');
    }

    registerEvents() {
        // ?.length: registerEvents() is first called by the base (before init(),
        // so filenameLabelTemplate is undefined). Only bind after init, and only
        // if the template actually exists in the DOM.
        if (this.filenameLabelTemplate?.length) {
            let self = this;

            self.elt.on('change', function () {
                self.filenameLabelContainer.empty();

                Array.from(this.files).forEach(function(file, index) {
                    let newFilenameLabel = self.filenameLabelTemplate.clone();
                    newFilenameLabel.show();

                    newFilenameLabel.find('.roro-file-name-text').text(file.name);

                    newFilenameLabel.find('.roro-file-name-delete').on('click', function () {
                        let dt = new DataTransfer();
                        Array.from(self.elt[0].files).forEach((f, i) => {
                            if (i !== index) {
                                dt.items.add(f);
                            }
                        });

                        self.elt[0].files = dt.files;

                        newFilenameLabel.remove();
                    });

                    newFilenameLabel.appendTo(self.filenameLabelContainer);
                });
            });
        }
    }



}

window.RoroFile = RoroFile;
