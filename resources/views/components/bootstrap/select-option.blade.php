<div id="{{$id}}"
     style="cursor:pointer; @if($hidden) display:none; @endif"
     role="option"
     aria-selected="false"
     data-value="{{$value}}"
     data-label="{{$label}}"
     class="roro-select-option position-relative px-3 py-2 small text-body {{$class}}">

    <!-- Overlay -->
    <span style="display: none;" class="roro-select-option-overlay position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-10 pe-none"></span>

    <span class="roro-select-option-label position-relative">{{$label}}</span>
    <span style="display: none;" class="roro-select-option-check position-absolute top-50 end-0 translate-middle-y me-3 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="d-block">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
    </span>
</div>
