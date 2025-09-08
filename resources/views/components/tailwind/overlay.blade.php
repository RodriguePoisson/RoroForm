<div id="roro-form-overlay" style="@if(!$visible) display:none; @endif" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    @if($spinner)
        <div class="w-1/5">
            <x-roro-spinner :visible="true"></x-roro-spinner>
        </div>
    @endif
</div>
