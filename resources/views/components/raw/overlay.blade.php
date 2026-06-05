<div id="roro-form-overlay" style="@if(!$visible) display:none; @endif" role="status" aria-live="polite">
    <span class="roro-sr-only">Loading…</span>
    @if($spinner)
        <div class="roro-spinner" aria-hidden="true">
            <x-roro-spinner :visible="true"></x-roro-spinner>
        </div>
    @endif
</div>
