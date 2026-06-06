<div id="{{$id}}"
     style="@if($hidden) display:none; @endif"
     role="option"
     aria-selected="false"
     data-value="{{$value}}"
     data-label="{{$label}}"
     class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50 {{$class}}">

    <!-- Overlay -->
    <span style="display: none;" class="roro-select-option-overlay absolute inset-0 bg-blue-50 pointer-events-none"></span>

    <span class="roro-select-option-label relative z-10">{{$label}}</span>
    <span style="display: none;" class="roro-select-option-check absolute right-3 top-1/2 -translate-y-1/2 hidden text-blue-600 z-10">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="block h-4 w-4">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
        </svg>
    </span>
</div>
