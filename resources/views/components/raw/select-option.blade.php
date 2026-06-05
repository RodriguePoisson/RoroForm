<div id="{{$id}}"
     style="@if($hidden) display:none; @endif"
     role="option"
     aria-selected="false"
     data-value="{{$value}}"
     data-label="{{$label}}"
     class="roro-select-option {{$class}}">

    <span style="display: none;" class="roro-select-option-overlay" aria-hidden="true"></span>
    <span class="roro-select-option-label">{{$label}}</span>
    <span style="display: none;" class="roro-select-option-check" aria-hidden="true">✓</span>
</div>
