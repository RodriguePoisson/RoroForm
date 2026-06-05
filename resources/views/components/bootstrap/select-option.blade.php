<div id="{{$id}}"
     style="cursor:pointer; @if($hidden) display:none; @endif"
     data-value="{{$value}}"
     data-label="{{$label}}"
     class="roro-select-option position-relative px-3 py-2 small text-body {{$class}}">

    <!-- Overlay -->
    <span style="display: none;" class="roro-select-option-overlay position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-10 pe-none"></span>

    <span class="roro-select-option-label position-relative">{{$label}}</span>
    <span style="display: none;" class="roro-select-option-check position-absolute top-50 end-0 translate-middle-y me-2 text-primary">✔</span>
</div>
