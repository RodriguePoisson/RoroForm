{{-- No d-flex here: Bootstrap's display utilities are !important and would
     override the inline display:none the JS toggles. The spinner is centred
     with absolute positioning so a plain display:block (jQuery fadeIn) works. --}}
<div id="roro-form-overlay" style="z-index:1055; @if(!$visible) display:none; @endif" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50">
    @if($spinner)
        <div class="position-absolute top-50 start-50 translate-middle" style="width:20%;">
            <x-roro-spinner :visible="true"></x-roro-spinner>
        </div>
    @endif
</div>
