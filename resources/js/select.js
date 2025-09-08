window.listOfSelect = window.listOfSelect || [];

window.roroAddOption = function(inputId,key,value,categogryLabel = null){
    let select = listOfSelect.find(select => select.id === 'roro-wrapper-'+inputId);
    if(select){
        select.ready.then(() => {
            let option = new Option(key, null, value);
            option.ready.then(() => {
                select.addOption(option, categogryLabel);
            });
        });
    }
}

window.roroDisableSelect = function(inputId,disable = true){
    let select = listOfSelect.find(select => select.id === 'roro-wrapper-'+inputId);
    select.ready.then(() => {
        select.disable(disable);
    });
}

window.roroReadonlySelect = function(inputId,readonly = true){
    let select = listOfSelect.find(select => select.id === 'roro-wrapper-'+inputId);
    select.ready.then(() => {
        select.readonly(readonly);
    });
}

window.roroShowDropDown = function(inputId,show = true){
    let select = listOfSelect.find(select => select.id === 'roro-wrapper-'+inputId);
    select.ready.then(() => {
        let wrapper = select.elt;
        if (!select) {
            throw new Error(`Select with id ${inputId} not found`);
        }

        wrapper.data('show', show);
        select.showDropDown(show);
    });


}

window.addSelect = function(elt)
{
    let select = new RoroSelect(elt.data('id'), elt.data('options'), elt.data('value'));
    listOfSelect.push(select);
}

window.addMultiSelect = function(elt)
{
    let multiSelect = new RoroMultiSelect(elt.data('id'),elt.data('name'), elt.data('options'), elt.data('values'));
    listOfSelect.push(multiSelect);
}

$(document).ready(function(){
    $('.roro-wrapper-select').each(function() {
        addSelect($(this));
    });

    $('.roro-wrapper-multi-select').each(function() {
        addMultiSelect($(this));
    });
});
