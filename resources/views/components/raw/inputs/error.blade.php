{{-- aria-live so a message set by JS (roroShowError) is announced; the id lets
     the matching input point at it via aria-describedby. --}}
<div id="{{$id}}" style="@if($hidden) display:none; @endif" class="roro-input-error-container" aria-live="polite">
    <p class="roro-input-error-message">{{ $error }}</p>
</div>
